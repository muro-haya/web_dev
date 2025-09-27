from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime

from models import Slot, Base
from schemas import SlotSchema
from init_data import init_slots

from database import engine, Base, get_db
from routers import search, tasks
from utils.ws import clients, broadcast

Base.metadata.create_all(bind=engine)

init_slots()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "https://web-dev-gamma-three.vercel.app",
                    "http://localhost:3000",
                    "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(tasks.router)

class SlotUpdate(BaseModel):
    car_number: str | None = None

@app.get("/slots/")
def get_slots(db: Session = Depends(get_db)):
    return db.query(Slot).all()

@app.post("/slots/{slot_id}/", response_model=SlotSchema)
async def update_slot(slot_id: int, slot_data: SlotUpdate, db: Session = Depends(get_db)):
    slot = db.query(Slot).filter(Slot.id == slot_id).first()
    if not slot:
        raise Exception("Slot not found")

    # Update database record
    slot.car_number = slot_data.car_number
    slot.status = "occupied" if slot.car_number else "empty"
    db.commit()
    db.refresh(slot)

   # Broadcast slot update to all clients
    message = {
        "type": "slot_update",                        # Message type
        "payload": SlotSchema.from_orm(slot).dict(),  # Actual slot data
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    asyncio.create_task(broadcast(message))

    return slot

@app.get("/")
def root():
    return {"message": "Parking System Backend is running!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            # Keep the connection alive by waiting for ping/pong or empty messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        # Clean up disconnected client
        if websocket in clients:
            clients.remove(websocket)
