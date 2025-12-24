import requests
import sys
from datetime import datetime
import json

class BharatBazaarAPITester:
    def __init__(self, base_url="https://retailhub-59.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use admin token if specified
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint,
                    "error": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"phone": "+919999999999", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_dashboard_stats(self):
        """Test admin dashboard stats"""
        return self.run_test(
            "Dashboard Stats",
            "GET",
            "admin/dashboard",
            200,
            use_admin=True
        )

    def test_categories(self):
        """Test categories endpoints"""
        # Get categories
        success1, _ = self.run_test("Get Categories", "GET", "categories", 200)
        
        # Create category (admin)
        success2, response = self.run_test(
            "Create Category",
            "POST",
            "admin/categories",
            200,
            data={
                "name": "Test Category",
                "description": "Test category description",
                "is_active": True
            },
            use_admin=True
        )
        
        return success1 and success2

    def test_products(self):
        """Test products endpoints"""
        # Get products
        success1, _ = self.run_test("Get Products", "GET", "products", 200)
        
        # Create product (admin) - need category first
        success2, response = self.run_test(
            "Create Product",
            "POST",
            "admin/products",
            200,
            data={
                "name": "Test Product",
                "description": "Test product description",
                "category_id": "test-category-id",
                "sku": f"TEST{datetime.now().strftime('%H%M%S')}",
                "mrp": 1000,
                "selling_price": 800,
                "wholesale_price": 600,
                "cost_price": 400,
                "stock_qty": 100,
                "gst_rate": 18.0,
                "is_active": True
            },
            use_admin=True
        )
        
        return success1 and success2

    def test_inventory(self):
        """Test inventory endpoints"""
        return self.run_test(
            "Get Inventory",
            "GET",
            "admin/inventory",
            200,
            use_admin=True
        )

    def test_orders(self):
        """Test orders endpoints"""
        return self.run_test(
            "Get Orders",
            "GET",
            "admin/orders",
            200,
            use_admin=True
        )

    def test_banners(self):
        """Test banners endpoints"""
        # Get banners (public)
        success1, _ = self.run_test("Get Banners", "GET", "banners", 200)
        
        # Create banner (admin)
        success2, _ = self.run_test(
            "Create Banner",
            "POST",
            "admin/banners",
            200,
            data={
                "title": "Test Banner",
                "image_url": "https://example.com/banner.jpg",
                "position": 1,
                "is_active": True
            },
            use_admin=True
        )
        
        return success1 and success2

    def test_couriers(self):
        """Test courier endpoints"""
        return self.run_test(
            "Get Couriers",
            "GET",
            "admin/couriers",
            200,
            use_admin=True
        )

    def test_payment_gateways(self):
        """Test payment gateway endpoints"""
        return self.run_test(
            "Get Payment Gateways",
            "GET",
            "admin/payment-gateways",
            200,
            use_admin=True
        )

    def test_reports(self):
        """Test reports endpoints"""
        success1, _ = self.run_test(
            "Sales Report",
            "GET",
            "admin/reports/sales",
            200,
            use_admin=True
        )
        
        success2, _ = self.run_test(
            "Inventory Report",
            "GET",
            "admin/reports/inventory",
            200,
            use_admin=True
        )
        
        return success1 and success2

    def test_settings(self):
        """Test settings endpoints"""
        return self.run_test(
            "Get Settings",
            "GET",
            "admin/settings",
            200,
            use_admin=True
        )

    def test_seed_data(self):
        """Test seed data creation"""
        return self.run_test(
            "Seed Data",
            "POST",
            "admin/seed-data",
            200,
            use_admin=True
        )

def main():
    print("🚀 Starting BharatBazaar API Tests...")
    print("=" * 50)
    
    tester = BharatBazaarAPITester()
    
    # Test sequence
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("Admin Login", tester.test_admin_login),
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("Categories", tester.test_categories),
        ("Products", tester.test_products),
        ("Inventory", tester.test_inventory),
        ("Orders", tester.test_orders),
        ("Banners", tester.test_banners),
        ("Couriers", tester.test_couriers),
        ("Payment Gateways", tester.test_payment_gateways),
        ("Reports", tester.test_reports),
        ("Settings", tester.test_settings),
        ("Seed Data", tester.test_seed_data),
    ]
    
    passed_tests = []
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if result:
                passed_tests.append(test_name)
            else:
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            print(f"  - {failure.get('test', 'Unknown')}: {failure.get('error', 'Unknown error')}")
    
    if passed_tests:
        print(f"\n✅ PASSED TESTS: {', '.join(passed_tests)}")
    
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())