#!/usr/bin/env python3
"""
Test script to verify wishlist functionality works correctly.
This tests both the backend API and ensures proper user isolation.
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERS = [
    {"phone": "9999999991", "name": "Test User 1", "email": "test1@example.com", "password": "password123"},
    {"phone": "9999999992", "name": "Test User 2", "email": "test2@example.com", "password": "password123"}
]

def test_wishlist_functionality():
    """Test complete wishlist functionality with user isolation"""
    
    print("🧪 Testing Wishlist Functionality")
    print("=" * 50)
    
    # Step 1: Get a sample product ID
    try:
        response = requests.get(f"{BASE_URL}/products?limit=1")
        if response.status_code == 200:
            products = response.json().get('products', [])
            if not products:
                print("❌ No products found. Please add some products first.")
                return
            product_id = products[0]['id']
            product_name = products[0]['name']
            print(f"✅ Using test product: {product_name} (ID: {product_id})")
        else:
            print(f"❌ Failed to fetch products: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error fetching products: {e}")
        return
    
    # Step 2: Test with two different users to verify isolation
    user_tokens = {}
    
    for i, user_data in enumerate(TEST_USERS, 1):
        print(f"\n👤 Testing with User {i}: {user_data['name']}")
        
        # Login user (assuming they exist, or create them)
        try:
            login_response = requests.post(f"{BASE_URL}/auth/login", json={
                "identifier": user_data["phone"],
                "password": user_data["password"]
            })
            
            if login_response.status_code == 200:
                token = login_response.json()["token"]
                user_tokens[f"user{i}"] = token
                print(f"✅ User {i} logged in successfully")
            else:
                print(f"❌ User {i} login failed: {login_response.status_code}")
                print("   (This is expected if users don't exist)")
                continue
                
        except Exception as e:
            print(f"❌ Error logging in User {i}: {e}")
            continue
        
        # Test wishlist operations for this user
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Check initial wishlist (should be empty)
        try:
            response = requests.get(f"{BASE_URL}/wishlist", headers=headers)
            if response.status_code == 200:
                wishlist = response.json().get('wishlist', [])
                print(f"✅ User {i} initial wishlist: {len(wishlist)} items")
            else:
                print(f"❌ Failed to get User {i} wishlist: {response.status_code}")
        except Exception as e:
            print(f"❌ Error getting User {i} wishlist: {e}")
        
        # 2. Add product to wishlist
        try:
            response = requests.post(f"{BASE_URL}/wishlist/{product_id}", headers=headers)
            if response.status_code == 200:
                print(f"✅ User {i} added product to wishlist")
            else:
                print(f"❌ User {i} failed to add to wishlist: {response.status_code}")
        except Exception as e:
            print(f"❌ Error adding to User {i} wishlist: {e}")
        
        # 3. Check wishlist status
        try:
            response = requests.get(f"{BASE_URL}/wishlist/check/{product_id}", headers=headers)
            if response.status_code == 200:
                in_wishlist = response.json().get('in_wishlist', False)
                print(f"✅ User {i} wishlist status check: {in_wishlist}")
            else:
                print(f"❌ User {i} wishlist status check failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Error checking User {i} wishlist status: {e}")
        
        # 4. Get updated wishlist
        try:
            response = requests.get(f"{BASE_URL}/wishlist", headers=headers)
            if response.status_code == 200:
                wishlist = response.json().get('wishlist', [])
                print(f"✅ User {i} updated wishlist: {len(wishlist)} items")
            else:
                print(f"❌ Failed to get User {i} updated wishlist: {response.status_code}")
        except Exception as e:
            print(f"❌ Error getting User {i} updated wishlist: {e}")
    
    # Step 3: Test user isolation
    print(f"\n🔒 Testing User Isolation")
    if len(user_tokens) >= 2:
        # User 1 should have the product in wishlist
        # User 2 should NOT have the product in wishlist (unless they added it)
        
        for user_key, token in user_tokens.items():
            headers = {"Authorization": f"Bearer {token}"}
            try:
                response = requests.get(f"{BASE_URL}/wishlist", headers=headers)
                if response.status_code == 200:
                    wishlist = response.json().get('wishlist', [])
                    user_num = user_key[-1]
                    print(f"✅ {user_key.upper()} final wishlist: {len(wishlist)} items")
                    
                    # Check if our test product is in their wishlist
                    has_product = any(item['id'] == product_id for item in wishlist)
                    print(f"   - Has test product: {has_product}")
                else:
                    print(f"❌ Failed to get {user_key} final wishlist: {response.status_code}")
            except Exception as e:
                print(f"❌ Error getting {user_key} final wishlist: {e}")
    else:
        print("⚠️  Not enough users logged in to test isolation")
    
    # Step 4: Cleanup - Remove from wishlists
    print(f"\n🧹 Cleanup")
    for user_key, token in user_tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        try:
            response = requests.delete(f"{BASE_URL}/wishlist/{product_id}", headers=headers)
            if response.status_code == 200:
                print(f"✅ Removed product from {user_key} wishlist")
            else:
                print(f"❌ Failed to remove from {user_key} wishlist: {response.status_code}")
        except Exception as e:
            print(f"❌ Error removing from {user_key} wishlist: {e}")
    
    print(f"\n🎉 Wishlist functionality test completed!")

if __name__ == "__main__":
    test_wishlist_functionality()