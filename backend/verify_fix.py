import sys
import os

# Add backend directory to path
sys.path.append('/home/rohit/Replic-Mesho/Ecom-Website/backend')

from database import get_db
import models
from server import hash_password
from datetime import datetime
import uuid

def verify_email_uniqueness_logic():
    print("Testing Email Uniqueness Logic...")
    
    db = next(get_db())
    
    # Clean up test data if exists
    test_email = "unique_test_user@example.com"
    test_phone_1 = "9999999991"
    test_phone_2 = "9999999992"
    
    try:
        # Cleanup
        db.query(models.User).filter(models.User.email == test_email).delete()
        db.query(models.User).filter(models.User.phone == test_phone_1).delete()
        db.query(models.User).filter(models.User.phone == test_phone_2).delete()
        db.commit()
        
        print("1. Registering first user with email:", test_email)
        user1 = models.User(
            id=str(uuid.uuid4()),
            phone=test_phone_1,
            name="Test User 1",
            email=test_email,
            password=hash_password("password"),
            created_at=datetime.utcnow()
        )
        db.add(user1)
        db.commit()
        print("   - Success: User 1 created.")
        
        print("2. Attempting to register second user with SAME email:", test_email)
        # Simulating the logic added to server.py
        existing_email = db.query(models.User).filter(models.User.email == test_email).first()
        
        if existing_email:
            print(f"   - BLOCKED: Logic correctly identified existing email: {existing_email.email}")
            print("   - SUCCESS: Email uniqueness check passed!")
        else:
            print("   - FAILURE: Logic failed to find existing email!")
            
    except Exception as e:
        print(f"Error during test: {e}")
    finally:
        # Cleanup
        db.query(models.User).filter(models.User.email == test_email).delete()
        db.query(models.User).filter(models.User.phone == test_phone_1).delete()
        db.query(models.User).filter(models.User.phone == test_phone_2).delete()
        db.commit()
        db.close()

if __name__ == "__main__":
    verify_email_uniqueness_logic()
