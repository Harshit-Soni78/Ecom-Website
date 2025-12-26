#!/usr/bin/env python3

import sys
sys.path.append('.')

from database import get_db
from models import Product, Order, Settings
import json

def test_inventory_report():
    db = next(get_db())
    try:
        # Test the inventory status calculation directly
        products = db.query(Product).filter(Product.is_active == True).all()
        
        inventory_report = []
        
        for product in products:
            # Calculate blocked quantity in pending orders
            pending_orders = db.query(Order).filter(
                Order.status.in_(["pending", "processing"])
            ).all()
            
            blocked_qty = 0
            for order in pending_orders:
                for item in order.items:
                    if item.get("product_id") == product.id:
                        blocked_qty += item.get("quantity", 0)
            
            # Calculate available quantity (stock - blocked)
            available_qty = max(0, product.stock_qty - blocked_qty)
            
            # Determine stock status
            if product.stock_qty <= 0:
                stock_status = "out_of_stock"
            elif product.stock_qty <= product.low_stock_threshold:
                stock_status = "low_stock"
            elif available_qty <= product.low_stock_threshold:
                stock_status = "reserved_low"
            else:
                stock_status = "in_stock"
            
            inventory_report.append({
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "category_name": product.category.name if product.category else "Uncategorized",
                "total_stock": product.stock_qty,
                "blocked_qty": blocked_qty,
                "available_qty": available_qty,
                "low_stock_threshold": product.low_stock_threshold,
                "stock_status": stock_status,
                "selling_price": product.selling_price,
                "cost_price": product.cost_price,
                "stock_value": product.stock_qty * product.cost_price,
                "available_value": available_qty * product.cost_price
            })
        
        # Calculate summary statistics
        total_products = len(inventory_report)
        total_stock_value = sum(item["stock_value"] for item in inventory_report)
        total_available_value = sum(item["available_value"] for item in inventory_report)
        total_blocked_value = total_stock_value - total_available_value
        
        out_of_stock_count = len([item for item in inventory_report if item["stock_status"] == "out_of_stock"])
        low_stock_count = len([item for item in inventory_report if item["stock_status"] in ["low_stock", "reserved_low"]])
        in_stock_count = len([item for item in inventory_report if item["stock_status"] == "in_stock"])
        
        print("📊 INVENTORY STATUS REPORT")
        print("=" * 50)
        print(f"Total Products: {total_products}")
        print(f"Total Stock Value: ₹{total_stock_value:,.2f}")
        print(f"Total Available Value: ₹{total_available_value:,.2f}")
        print(f"Total Blocked Value: ₹{total_blocked_value:,.2f}")
        print(f"Out of Stock: {out_of_stock_count}")
        print(f"Low Stock: {low_stock_count}")
        print(f"In Stock: {in_stock_count}")
        print()
        
        print("📦 PRODUCT DETAILS")
        print("-" * 80)
        for item in inventory_report[:5]:  # Show first 5 products
            print(f"Product: {item['product_name']}")
            print(f"  SKU: {item['sku']}")
            print(f"  Category: {item['category_name']}")
            print(f"  Total Stock: {item['total_stock']}")
            print(f"  Blocked: {item['blocked_qty']}")
            print(f"  Available: {item['available_qty']}")
            print(f"  Status: {item['stock_status']}")
            print(f"  Stock Value: ₹{item['stock_value']:,.2f}")
            print()
        
        if len(inventory_report) > 5:
            print(f"... and {len(inventory_report) - 5} more products")
        
        print("✅ Inventory report generated successfully!")
        
    except Exception as e:
        print(f"❌ Error generating inventory report: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_inventory_report()