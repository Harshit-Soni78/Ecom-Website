#!/bin/bash
echo "Starting BharatBazaar Backend Server..."

# Navigate to the backend directory
cd /home/rohit/Replic-Mesho/Ecom-Website/backend

# Check if venv exists
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment not found! Please create it first."
    exit 1
fi

# Start the server
echo "Server running at http://localhost:8000"
echo "Press CTRL+C to stop"
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
