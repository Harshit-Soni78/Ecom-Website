#!/usr/bin/env python3
"""
Test script for the enhanced return and cancellation system
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def test_api_endpoint(method, endpoint, data=None, headers=None, files=None):
    """Test an API endpoint and return response"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=data)
        elif method == "POST":
            if files:
                response = requests.post(url, headers=headers, data=data, files=files)
            else:
                response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        print(f"   {method} {endpoint} - {response.status_code}")
        if response.status_code >= 400:
            print(f"   Error: {response.text[:200]}")
        
        return response.status_code < 400, response
    except Exception as e:
        print(f"❌ {method} {endpoint} - ERROR - {str(e)}")
        return False, None

def get_auth_token():
    """Get authentication token"""
    print("🔐 Getting authentication token...")
    
    success, response = test_api_endpoint("POST", "/auth/login", {
        "identifier": "8233189764",
        "password": "Rohit@123"
    })
    
    if response and response.status_code == 200:
        return response.json().get("token")
    return None

def create_test_order(headers):
    """Create a test order for cancellation/return testing"""
    print("📦 Creating test order...")
    
    # First, get available products
    success, response = test_api_endpoint("GET", "/products", headers=headers)
    if not success or not response.json().get("products"):
        print("❌ No products available for testing")
        return None
    
    products = response.json()["products"]
    if not products:
        print("❌ No products found")
        return None
    
    # Create order with first available product
    product = products[0]
    order_data = {
        "items": [
            {
                "product_id": product["id"],
                "quantity": 1
            }
        ],
        "shipping_address": {
            "name": "Test Customer",
            "phone": "9999999999",
            "line1": "Test Address Line 1",
            "line2": "Test Address Line 2",
            "city": "New Delhi",
            "state": "Delhi",
            "pincode": "110001"
        },
        "payment_method": "cod",
        "apply_gst": True
    }
    
    success, response = test_api_endpoint("POST", "/orders", order_data, headers)
    if success and response:
        order = response.json()
        print(f"   ✅ Created order: {order.get('order_number')}")
        return order
    
    return None

def test_cancellation_system(headers):
    """Test order cancellation functionality"""
    print("\n🚫 Testing Order Cancellation System...")
    
    # Create test order
    order = create_test_order(headers)
    if not order:
        print("❌ Failed to create test order")
        return False
    
    order_id = order["id"]
    
    # Test cancellation eligibility check
    print("   📋 Checking cancellation eligibility...")
    success, response = test_api_endpoint("GET", f"/orders/{order_id}/can-cancel", headers=headers)
    if success:
        eligibility = response.json()
        print(f"   ✅ Can cancel: {eligibility.get('can_cancel')}")
        print(f"   ✅ Refund amount: ₹{eligibility.get('refund_amount', 0)}")
    
    # Test order cancellation
    print("   🚫 Cancelling order...")
    cancel_data = {
        "order_id": order_id,
        "reason": "Changed my mind about the purchase",
        "cancellation_type": "customer"
    }
    
    success, response = test_api_endpoint("POST", f"/orders/{order_id}/cancel", cancel_data, headers)
    if success:
        result = response.json()
        print(f"   ✅ Order cancelled: {result.get('message')}")
        print(f"   ✅ Refund timeline: {result.get('refund_timeline')}")
    
    return success

def test_return_system(headers):
    """Test return request functionality"""
    print("\n🔄 Testing Return Request System...")
    
    # Create test order and simulate delivery
    order = create_test_order(headers)
    if not order:
        print("❌ Failed to create test order")
        return False
    
    order_id = order["id"]
    
    # Simulate order delivery (admin action)
    print("   📦 Simulating order delivery...")
    admin_headers = headers  # Assuming admin token for testing
    
    delivery_data = {
        "status": "delivered",
        "notes": "Order delivered successfully for testing"
    }
    
    success, response = test_api_endpoint("PUT", f"/admin/orders/{order_id}/status", delivery_data, admin_headers)
    if success:
        print("   ✅ Order marked as delivered")
    
    # Test return eligibility check
    print("   📋 Checking return eligibility...")
    success, response = test_api_endpoint("GET", f"/orders/{order_id}/can-return", headers=headers)
    if success:
        eligibility = response.json()
        print(f"   ✅ Can return: {eligibility.get('can_return')}")
        if eligibility.get('return_window_remaining'):
            print(f"   ✅ Return window: {eligibility.get('return_window_remaining')}")
    
    # Test return request creation
    print("   🔄 Creating return request...")
    return_data = {
        "order_id": order_id,
        "items": order["items"],
        "reason": "Product arrived damaged",
        "return_type": "defective",
        "refund_method": "original",
        "description": "The product packaging was damaged and the item inside was broken"
    }
    
    success, response = test_api_endpoint("POST", f"/orders/{order_id}/return", return_data, headers)
    if success:
        result = response.json()
        print(f"   ✅ Return request created: {result.get('return_id')}")
        print(f"   ✅ Review timeline: {result.get('review_timeline')}")
        return result.get('return_id')
    
    return None

def test_return_management(headers, return_id):
    """Test return request management (admin functions)"""
    print("\n👨‍💼 Testing Return Management...")
    
    if not return_id:
        print("❌ No return ID provided")
        return False
    
    # Test getting all returns (admin)
    print("   📋 Getting all return requests...")
    success, response = test_api_endpoint("GET", "/admin/returns", headers=headers)
    if success:
        returns = response.json().get("returns", [])
        print(f"   ✅ Found {len(returns)} return requests")
    
    # Test return approval
    print("   ✅ Approving return request...")
    approval_data = {
        "status": "approved",
        "admin_notes": "Return approved after reviewing evidence. Pickup scheduled.",
        "refund_amount": 1200.0
    }
    
    success, response = test_api_endpoint("PUT", f"/admin/returns/{return_id}", approval_data, headers)
    if success:
        result = response.json()
        print(f"   ✅ Return approved: {result.get('message')}")
    
    # Test return tracking
    print("   📍 Testing return tracking...")
    success, response = test_api_endpoint("GET", f"/returns/{return_id}/tracking", headers=headers)
    if success:
        tracking = response.json()
        print(f"   ✅ Tracking available: {tracking.get('tracking_available', False)}")
    
    return success

def test_notification_system(headers):
    """Test notification system for returns and cancellations"""
    print("\n🔔 Testing Notification System...")
    
    # Test getting user notifications
    success, response = test_api_endpoint("GET", "/notifications", headers=headers)
    if success:
        notifications = response.json().get("notifications", [])
        unread_count = response.json().get("unread_count", 0)
        print(f"   ✅ Found {len(notifications)} notifications ({unread_count} unread)")
        
        # Show recent notifications related to returns/cancellations
        relevant_notifications = [
            n for n in notifications 
            if n.get("type") in ["order_cancelled", "return_request", "return_approved", "return_rejected"]
        ]
        
        if relevant_notifications:
            print("   📋 Recent return/cancellation notifications:")
            for notif in relevant_notifications[:3]:
                print(f"      • {notif.get('title')}: {notif.get('message')[:50]}...")
    
    # Test admin notifications
    success, response = test_api_endpoint("GET", "/admin/notifications", headers=headers)
    if success:
        admin_notifications = response.json().get("notifications", [])
        print(f"   ✅ Found {len(admin_notifications)} admin notifications")
    
    return success

def main():
    """Run all tests"""
    print("=" * 80)
    print("🧪 Enhanced Return & Cancellation System Tests")
    print("=" * 80)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/auth/test")
        # 401, 403, or 422 are expected without auth, which means server is responding
        if response.status_code not in [401, 403, 422]:
            print(f"❌ Server responding with unexpected status: {response.status_code}")
            return
        print("✅ Server is running and responding")
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get auth token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Run tests
    tests = [
        ("Order Cancellation", lambda: test_cancellation_system(headers)),
        ("Return Request System", lambda: test_return_system(headers)),
        ("Notification System", lambda: test_notification_system(headers))
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} tests...")
        try:
            if test_name == "Return Request System":
                return_id = test_func()
                if return_id:
                    # Test return management with the created return
                    test_return_management(headers, return_id)
                results.append((test_name, return_id is not None))
            else:
                result = test_func()
                results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed: {str(e)}")
            results.append((test_name, False))
    
    # Print results summary
    print("\n" + "=" * 80)
    print("📊 Test Results Summary")
    print("=" * 80)
    
    passed = 0
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name:<30} {status}")
        if success:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Return & Cancellation system is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    main()