from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://parking_memory_user:2qFKwMwjQbVo8ds42sYiTJmDpS265Lpy@dpg-d2q29bfdiees73cgpfcg-a:5432/parking_memory/"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
