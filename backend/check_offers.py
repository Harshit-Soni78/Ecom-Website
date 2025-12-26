from database import get_db
from models import Offer
from sqlalchemy.orm import Session
import datetime

db: Session = next(get_db())
try:
    offers = db.query(Offer).all()
    print(f"Total Offers found: {len(offers)}")
    for offer in offers:
        print(f"ID: {offer.id}")
        print(f"Title: {offer.title}")
        print(f"Is Active: {offer.is_active}")
        print(f"Discount: {offer.discount_value} ({offer.discount_type})")
        print("---")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
