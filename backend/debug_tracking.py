#!/usr/bin/env python3
import sys
sys.path.append('/home/rohit/Replic-Mesho/Ecom-Website/backend')
from courier_service import DelhiveryService
import logging

# Configure logging to see internal logs
logging.basicConfig(level=logging.INFO)

def test_tracking():
    # Token from your env or hardcoded for test if known, otherwise dummy
    # The service likely initiates with a token from env in real usage
    import os
    from dotenv import load_dotenv
    load_dotenv('/home/rohit/Replic-Mesho/Ecom-Website/backend/.env')
    
    token = os.getenv("DELHIVERY_API_TOKEN", "dummy_token")
    service = DelhiveryService(token)
    
    awb = "47301410000022" # From user screenshot
    print(f"Tracking AWB: {awb}")
    
    result = service.track_order(awb)
    print("\n--- TRACKING RESULT ---")
    print(result)

if __name__ == "__main__":
    test_tracking()
