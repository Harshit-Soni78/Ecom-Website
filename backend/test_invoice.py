#!/usr/bin/env python3

import sys
sys.path.append('.')

from database import get_db
from models import Order, Settings
from server import generate_invoice_pdf, generate_shipping_label_pdf

def test_invoice_generation():
    db = next(get_db())
    try:
        # Get first order
        order = db.query(Order).first()
        if not order:
            print("No orders found")
            return
        
        print(f"Testing invoice generation for order: {order.order_number}")
        
        # Test invoice generation
        try:
            pdf_buffer = generate_invoice_pdf(order.id, db)
            print(f"✅ Invoice PDF generated successfully! Size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save to file for testing
            with open(f"test_invoice_{order.order_number}.pdf", "wb") as f:
                f.write(pdf_buffer.getvalue())
            print(f"📄 Invoice saved as test_invoice_{order.order_number}.pdf")
            
        except Exception as e:
            print(f"❌ Invoice generation failed: {e}")
        
        # Test shipping label generation
        try:
            pdf_buffer = generate_shipping_label_pdf(order.id, db)
            print(f"✅ Shipping label PDF generated successfully! Size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save to file for testing
            with open(f"test_label_{order.order_number}.pdf", "wb") as f:
                f.write(pdf_buffer.getvalue())
            print(f"🏷️ Shipping label saved as test_label_{order.order_number}.pdf")
            
        except Exception as e:
            print(f"❌ Shipping label generation failed: {e}")
        
        # Check settings
        settings = db.query(Settings).first()
        if settings:
            print(f"📋 Company Name: {settings.company_name}")
            print(f"📋 Business Name: {settings.business_name}")
        else:
            print("⚠️ No settings found")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_invoice_generation()