#!/usr/bin/env python3
import sys
sys.path.append('/home/rohit/Replic-Mesho/Ecom-Website/backend')
from database import get_db
from models import Order, Settings

def check_data():
    db = next(get_db())
    try:
        print("--- APP SETTINGS ---")
        settings = db.query(Settings).filter(Settings.type == "business").first()
        if settings:
            print(f"Company Name: '{settings.company_name}'")
            print(f"Business Name: '{settings.business_name}'")
            print(f"Address: {settings.address}")
            print(f"GST: {settings.gst_number}")
        else:
            print("No business settings found!")

        print("\n--- LATEST ORDER ---")
        order = db.query(Order).order_by(Order.created_at.desc()).first()
        if order:
            print(f"Order: {order.order_number}")
            print(f"Shipping Address: {order.shipping_address}")
            print(f"Customer Phone: {order.customer_phone}")
            print(f"Items: {len(order.items)}")
        else:
            print("No orders found!")

    finally:
        db.close()

if __name__ == "__main__":
    check_data()
