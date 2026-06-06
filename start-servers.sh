#!/bin/bash

# Kill existing processes
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start backend
cd /Users/sachinrawat/Desktop/N/flight/backend
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to initialize
sleep 3

# Start frontend
cd /Users/sachinrawat/Desktop/N/flight
PORT=3000 BROWSER=none nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait and verify
sleep 10

echo ""
echo "=== Server Status ==="
lsof -i :5001 | grep LISTEN && echo "✅ Backend running on port 5001" || echo "❌ Backend NOT running"
lsof -i :3000 | grep LISTEN && echo "✅ Frontend running on port 3000" || echo "❌ Frontend NOT running"
echo ""
echo "Backend log: tail -f /Users/sachinrawat/Desktop/N/flight/backend/backend.log"
echo "Frontend log: tail -f /Users/sachinrawat/Desktop/N/flight/frontend.log"
