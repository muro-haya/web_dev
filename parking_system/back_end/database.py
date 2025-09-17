from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://parking_memory_user:2qFKwMwjQbVo8ds42sYiTJmDpS265Lpy@dpg-d2q29bfdiees73cgpfcg-a:5432/parking_memory"
# DATABASE_URL = "sqlite:///./parking_memory.db"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()