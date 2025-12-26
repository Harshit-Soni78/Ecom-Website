from backend.database import get_db
from backend import models
from sqlalchemy import func

def check_duplicate_emails():
    db = next(get_db())
    try:
        # Find emails that appear more than once
        duplicates = db.query(models.User.email, func.count(models.User.email))\
            .filter(models.User.email != None)\
            .group_by(models.User.email)\
            .having(func.count(models.User.email) > 1)\
            .all()
        
        if duplicates:
            print("Found duplicate emails:")
            for email, count in duplicates:
                print(f"Email: {email}, Count: {count}")
                # Get users with this email
                users = db.query(models.User).filter(models.User.email == email).all()
                for user in users:
                    print(f"  - User ID: {user.id}, Phone: {user.phone}, Name: {user.name}")
        else:
            print("No duplicate emails found.")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_duplicate_emails()
