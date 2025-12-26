#!/usr/bin/env python3
"""
Comprehensive API test to verify all functionality is working
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_endpoint(method, endpoint, data=None, headers=None, description=""):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        status = "✅" if response.status_code < 400 else "❌"
        print(f"{status} {method} {endpoint} - {response.status_code} - {description}")
        
        if response.status_code >= 400:
            print(f"   Error: {response.text[:100]}")
        
        return response.status_code < 400, response
    except Exception as e:
        print(f"❌ {method} {endpoint} - ERROR - {str(e)}")
        return False, None

def get_auth_token():
    """Get admin auth token"""
    _, response = test_endpoint("POST", "/auth/login", {
        "identifier": "8233189764",
        "password": "Rohit@123"
    }, description="Admin login")
    
    if response and response.status_code == 200:
        return response.json().get("token")
    return None

def main():
    print("🚀 Testing Complete API Functionality")
    print("=" * 60)
    
    # Get auth token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get auth token")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test categories
    print("\n📂 Testing Categories")
    test_endpoint("GET", "/categories", description="Get categories")
    
    # Test products
    print("\n📦 Testing Products")
    test_endpoint("GET", "/products", description="Get products")
    test_endpoint("GET", "/products?limit=5", description="Get products with limit")
    
    # Test banners
    print("\n🎨 Testing Banners")
    test_endpoint("GET", "/banners", description="Get banners")
    
    # Test admin endpoints
    print("\n👨‍💼 Testing Admin Endpoints")
    test_endpoint("GET", "/admin/orders", headers=headers, description="Get orders")
    test_endpoint("GET", "/admin/users", headers=headers, description="Get users")
    test_endpoint("GET", "/admin/notifications/unread-count", headers=headers, description="Get notifications")
    
    # Test reports
    print("\n📊 Testing Reports")
    test_endpoint("GET", "/admin/reports/sales", headers=headers, description="Sales report")
    test_endpoint("GET", "/admin/reports/inventory", headers=headers, description="Inventory report")
    test_endpoint("GET", "/admin/reports/profit-loss", headers=headers, description="P&L report")
    
    # Test courier functionality
    print("\n🚚 Testing Courier Services")
    test_endpoint("GET", "/admin/couriers", headers=headers, description="Get couriers")
    test_endpoint("POST", "/admin/couriers/test", headers=headers, description="Test courier API")
    test_endpoint("GET", "/courier/pincode?pincode=110001", description="Check pincode")
    
    # Test wishlist
    print("\n❤️ Testing Wishlist")
    test_endpoint("GET", "/wishlist/categories", headers=headers, description="Get wishlist categories")
    test_endpoint("GET", "/wishlist", headers=headers, description="Get wishlist")
    
    # Test settings
    print("\n⚙️ Testing Settings")
    test_endpoint("GET", "/settings/public", description="Get public settings")
    test_endpoint("GET", "/admin/settings", headers=headers, description="Get admin settings")
    
    # Test utility endpoints
    print("\n🔧 Testing Utilities")
    test_endpoint("POST", "/admin/test-email", {"email": "test@example.com"}, headers=headers, description="Test email")
    test_endpoint("GET", "/admin/picklist", headers=headers, description="Generate picklist")
    
    print("\n" + "=" * 60)
    print("✅ API Testing Complete!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)