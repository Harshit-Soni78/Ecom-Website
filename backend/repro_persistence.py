from database import SessionLocal
import models
import sys

def debug_persistence():
    db = SessionLocal()
    try:
        settings = db.query(models.Settings).filter(models.Settings.type == "business").first()
        if not settings:
            print("No settings found!")
            return
            
        print(f"Current Company Name in DB: '{settings.company_name}'")
        
        # Try to update
        new_name = "TEST_PERSISTENCE_VALUE"
        print(f"Updating Company Name to: '{new_name}'")
        settings.company_name = new_name
        
        # Also update social links to test that fix
        if not settings.social_links:
            settings.social_links = {}
        
        current_social = dict(settings.social_links)
        current_social["test_key"] = "test_value"
        settings.social_links = current_social
        
        db.commit()
        print("Committed.")
        
        # Refresh and verify
        db.expire_all()
        settings = db.query(models.Settings).filter(models.Settings.type == "business").first()
        print(f"Company Name after reload: '{settings.company_name}'")
        print(f"Social Links after reload: {settings.social_links}")
        
        if settings.company_name == new_name:
            print("SUCCESS: Persistence working correctly in isolation.")
        else:
            print("FAILURE: Persistence NOT working.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_persistence()
