from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine
from models import Slot, Base
from schemas import SlotSchema
from init_data import init_slots

Base.metadata.create_all(bind=engine)

init_slots()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SlotUpdate(BaseModel):
    car_number: str | None = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/slots/")
def get_slots(db: Session = Depends(get_db)):
    return db.query(Slot).all()

@app.post("/slots/{slot_id}/", response_model=SlotSchema)
def update_slot(slot_id: int, slot_data: SlotUpdate, db: Session = Depends(get_db)):
    slot = db.query(Slot).filter(Slot.id == slot_id).first()
    if not slot:
        raise Exception("Slot not found")

    slot.car_number = slot_data.car_number
    slot.status = "occupied" if slot.car_number else "empty"

    db.commit()
    db.refresh(slot)
    return slot

@app.get("/")
def root():
    return {"message": "Parking System Backend is running!"}
