import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Task, Slot
from schemas import TaskCreate, TaskSchema, TaskUpdate
from utils.ws import broadcast

router = APIRouter()

@router.post("/tasks/", response_model=TaskSchema)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    slot = db.get(Slot, payload.slot_id)
    if not slot:
        raise HTTPException(status_code=400, detail="Slot not found")

    new_task = Task(
        slot_id=payload.slot_id,
        priority=payload.priority,
        memo=payload.memo
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    task = (
        db.query(Task)
        .options(joinedload(Task.slot))
        .filter(Task.id == new_task.id)
        .first()
    )

    # WebSocket 経由で通知
    data = TaskSchema.from_orm(task).json()
    asyncio.create_task(broadcast(data))

    return task


@router.get("/tasks/", response_model=list[TaskSchema])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(Task).order_by(Task.created_at.desc()).all()


@router.patch("/tasks/{task_id}/", response_model=TaskSchema)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.priority is not None:
        task.priority = payload.priority
    if payload.memo is not None:
        task.memo = payload.memo
    if payload.done is not None:
        task.done = payload.done

    db.commit()
    db.refresh(task)

    task = (
        db.query(Task)
        .options(joinedload(Task.slot))
        .filter(Task.id == task.id)
        .first()
    )

    # WebSocket 経由で通知
    data = TaskSchema.from_orm(task).json()
    asyncio.create_task(broadcast(data))

    return task


@router.delete("/tasks/{task_id}/")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    # 削除通知を投げたい場合
    data = {"event": "task_deleted", "id": task_id}
    asyncio.create_task(broadcast(json.dumps(data)))

    return {"ok": True}
