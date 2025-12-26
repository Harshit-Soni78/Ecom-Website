import sys
sys.path.append('/home/rohit/Replic-Mesho/Ecom-Website/backend')
from database import get_db
import models
import bcrypt

def check_admin_user():
    db = next(get_db())
    try:
        admin_phone = "8233189764"
        admin = db.query(models.User).filter(models.User.phone == admin_phone).first()
        
        if not admin:
            print("Admin user NOT FOUND in database!")
        else:
            print(f"Admin User Found: ID={admin.id}, Name={admin.name}, Role={admin.role}")
            print(f"Stored Hash: {admin.password}")
            
            # Test password verification
            test_pass = "Rohit@123"
            try:
                is_valid = bcrypt.checkpw(test_pass.encode(), admin.password.encode())
                print(f"Password '{test_pass}' matches hash? {is_valid}")
            except Exception as e:
                print(f"Error verifying password: {e}")
                
            # Check by email too
            admin_email = "admin@bharatbazaar.com"
            by_email = db.query(models.User).filter(models.User.email == admin_email).first()
            if by_email:
                print(f"User found by email '{admin_email}': ID={by_email.id} (Same as phone? {admin.id == by_email.id})")
            else:
                print(f"User NOT found by email '{admin_email}'")

    finally:
        db.close()

if __name__ == "__main__":
    check_admin_user()
