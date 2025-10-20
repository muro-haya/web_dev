from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db
from models import Slot
from schemas import SlotSchema

router = APIRouter()

@router.get("/search/", response_model=list[SlotSchema])
def search_slots(q: str = Query("", min_length=0), limit: int = 10, db: Session = Depends(get_db)):
    if not q:
        return []
    stmt = select(Slot).where(Slot.car_number.ilike(f"%{q}%")).limit(limit)
    results = db.scalars(stmt).all()
    return results