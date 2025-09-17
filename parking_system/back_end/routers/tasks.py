# app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Task, Slot
from schemas import TaskCreate, TaskSchema, TaskUpdate

router = APIRouter()

@router.post("/tasks/", response_model=TaskSchema)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    # slot が存在するかチェック
    slot = db.get(Slot, payload.slot_id)
    if not slot:
        raise HTTPException(status_code=400, detail="Slot not found")

    # （任意）同一スロットの未完了タスク重複を防ぐならここでチェックする
    new_task = Task(slot_id=payload.slot_id, priority=payload.priority, memo=payload.memo)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    task = db.query(Task).options(joinedload(Task.slot)).filter(Task.id == new_task.id).first()

    # WebSocketに通知
    data = SlotSchema.from_orm(slot).json()
    for client in clients:
        try:
            await client.send_text(data)
        except Exception:
            pass

    return task

@router.get("/tasks/", response_model=list[TaskSchema])
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    return tasks

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
    task = db.query(Task).options(joinedload(Task.slot)).filter(Task.id == task.id).first()
    return task

@router.delete("/tasks/{task_id}/")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}
