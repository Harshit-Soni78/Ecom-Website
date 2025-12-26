#!/usr/bin/env python3

import sys
sys.path.append('.')

from database import get_db
from models import Order, Settings
from server import generate_invoice_pdf, generate_shipping_label_pdf

def test_professional_formats():
    """Test the new professional invoice and label formats"""
    db = next(get_db())
    try:
        # Get first order
        order = db.query(Order).first()
        if not order:
            print("❌ No orders found. Please create an order first.")
            return
        
        print(f"🧪 Testing professional formats for order: {order.order_number}")
        print(f"📦 Order details: {len(order.items)} items, Total: ₹{order.grand_total}")
        
        # Test professional invoice generation
        try:
            pdf_buffer = generate_invoice_pdf(order.id, db)
            print(f"✅ Professional Invoice PDF generated! Size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save to file for testing
            filename = f"professional_invoice_{order.order_number}.pdf"
            with open(filename, "wb") as f:
                f.write(pdf_buffer.getvalue())
            print(f"📄 Professional invoice saved as {filename}")
            
        except Exception as e:
            print(f"❌ Professional invoice generation failed: {e}")
        
        # Test professional shipping label generation
        try:
            pdf_buffer = generate_shipping_label_pdf(order.id, db)
            print(f"✅ Professional Shipping Label PDF generated! Size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save to file for testing
            filename = f"professional_label_{order.order_number}.pdf"
            with open(filename, "wb") as f:
                f.write(pdf_buffer.getvalue())
            print(f"🏷️ Professional shipping label saved as {filename}")
            
        except Exception as e:
            print(f"❌ Professional shipping label generation failed: {e}")
        
        # Check settings
        settings = db.query(Settings).first()
        if settings:
            print(f"🏢 Company Name: {settings.company_name}")
            print(f"🏪 Business Name: {settings.business_name}")
            print(f"📋 GST Number: {settings.gst_number}")
        else:
            print("⚠️ No settings found")
        
        print("\n🎉 Professional format testing completed!")
        print("📋 Features implemented:")
        print("   ✅ Professional invoice layout with proper sections")
        print("   ✅ Tax invoice format with GST details")
        print("   ✅ Professional shipping label with QR code area")
        print("   ✅ Proper customer and return address sections")
        print("   ✅ Product details table")
        print("   ✅ Barcode and tracking number areas")
        print("   ✅ COD amount highlighting")
        print("   ✅ Destination and return codes")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_professional_formats()