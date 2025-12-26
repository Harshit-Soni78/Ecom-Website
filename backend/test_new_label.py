#!/usr/bin/env python3
import sys
import os
sys.path.append('/home/rohit/Replic-Mesho/Ecom-Website/backend')

from database import get_db
from models import Order, Settings
from server import generate_shipping_label_pdf
import io

def generate_test_label():
    db = next(get_db())
    try:
        # Get latest order
        order = db.query(Order).order_by(Order.created_at.desc()).first()
        if not order:
            print("No orders found to test with.")
            return

        print(f"Generating label for Order: {order.order_number}")
        
        pdf_buffer = generate_shipping_label_pdf(order.id, db)
        
        output_filename = f"test_label_{order.order_number}.pdf"
        with open(output_filename, "wb") as f:
            f.write(pdf_buffer.getvalue())
            
        print(f"Label saved to {output_filename}")
        print(f"File size: {os.path.getsize(output_filename)} bytes")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    generate_test_label()
