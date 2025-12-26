import sqlite3
import sys

db_path = "local_db.sqlite"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(settings);")
    columns = cursor.fetchall()
    
    print("Columns in settings table:")
    found_company_name = False
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
        if col[1] == "company_name":
            found_company_name = True
            
    if not found_company_name:
        print("\nMISSING: company_name column is missing!")
        sys.exit(1)
    else:
        print("\nSUCCESS: company_name column exists.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
