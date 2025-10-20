from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# DATABASE_URL = "postgresql://parking_memory_yk1p_user:3a23VP0ZSJo3vjODMJkV6bn98C4fBP2I@dpg-d3cufkogjchc739hld4g-a:5432/parking_memory_yk1p"
DATABASE_URL = "sqlite:///./parking_memory.db"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()