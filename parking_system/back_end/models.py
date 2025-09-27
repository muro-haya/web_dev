from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

class Slot(Base):
    __tablename__ = "slots"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    status = Column(String, default="empty")  # "empty" or "occupied"
    car_number = Column(String, nullable=True)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    priority = Column(String, default="medium", nullable=False)
    memo = Column(Text, nullable=True)
    done = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    slot_id = Column(String, nullable=False)
    # slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False)
    # slot = relationship("Slot", backref="tasks")