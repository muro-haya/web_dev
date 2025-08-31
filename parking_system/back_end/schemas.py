from pydantic import BaseModel
from typing import Optional

class SlotSchema(BaseModel):
    id: int
    number: str
    status: str
    car_number: Optional[str] = None

    class Config:
        orm_mode = True
