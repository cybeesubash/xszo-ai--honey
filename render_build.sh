#!/bin/bash
# Combined Build Script for Backend + Dashboard on Render

echo "🚀 Starting CYBER-EYE Combined Build..."

# Step 1: Build Dashboard
echo "📊 Building Dashboard Frontend..."
cd dashboard
npm install
npm run build
echo "✅ Dashboard build complete"
cd ..

# Step 2: Install Backend Dependencies
echo "📡 Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt
echo "✅ Backend dependencies installed"
cd ..

echo "🎉 Combined build completed successfully!"
echo "📦 Dashboard built to: dashboard/dist/"
echo "🐍 Backend ready to serve both API and dashboard"