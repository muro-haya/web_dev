from database import SessionLocal
from models import Slot

def init_slots():
    db = SessionLocal()
    try:
        # existing = db.query(Slot).first()
        # if existing:
        #     return

        if db.query(Slot).count() == 0:
            for i in range(1, 26):
                db.add(Slot(number=f"S{i}", status="empty"))
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    init_slots()