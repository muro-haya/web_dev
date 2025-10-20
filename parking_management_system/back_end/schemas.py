from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime

class SlotSchema(BaseModel):
    id: int
    number: str
    status: str
    car_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TaskCreate(BaseModel):
    # slot_id: int
    slot_id: Optional[str] = None
    priority: Literal["low", "medium", "high"] = "medium"
    memo: Optional[str] = None

class TaskUpdate(BaseModel):
    priority: Optional[Literal["low", "medium", "high"]] = None
    memo: Optional[str] = None
    done: Optional[bool] = None

class TaskSchema(BaseModel):
    id: int
    # slot_id: int
    slot_id: Optional[str] = None
    priority: str
    memo: Optional[str] = None
    done: bool
    created_at: datetime
    slot: Optional[SlotSchema] = None
    model_config = ConfigDict(from_attributes=True)
