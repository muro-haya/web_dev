import asyncio
import json
from datetime import datetime
from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Task, Slot
from schemas import TaskCreate, TaskSchema, TaskUpdate
from utils.ws import broadcast

router = APIRouter()

@router.post("/tasks/", response_model=TaskSchema)
async def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    # Create new task
    new_task = Task(
        slot_id=payload.slot_id,
        priority=payload.priority,
        memo=payload.memo
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # WebSocket broadcast
    message = {
        "type": "todo_update",                          # Message type for the client
        "payload": jsonable_encoder(TaskSchema.from_orm(new_task)),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    asyncio.create_task(broadcast(message))

    return new_task

@router.get("/tasks/", response_model=list[TaskSchema])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(Task).order_by(Task.created_at.desc()).all()


@router.patch("/tasks/{task_id}/", response_model=TaskSchema)
async def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
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
        .filter(Task.id == task.id)
        .first()
    )

    # WebSocket broadcast
    message = {
        "type": "todo_update",                          # Message type for the client
        "payload": jsonable_encoder(TaskSchema.from_orm(task)), 
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    asyncio.create_task(broadcast(message))

    return task

@router.delete("/tasks/{task_id}/")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    message = {
        "type": "todo_deleted",  # ← message type for deletion
        "payload": {"id": task_id},  # deleted task id
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    asyncio.create_task(broadcast(message))

    return {"ok": True}
