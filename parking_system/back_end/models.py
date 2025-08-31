from sqlalchemy import Column, Integer, String
from database import Base

class Slot(Base):
    __tablename__ = "slots"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    status = Column(String, default="empty")  # "empty" or "occupied"
    car_number = Column(String, nullable=True)
