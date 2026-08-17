#!/bin/bash
# Render Build Script for CYBER-EYE Platform

echo "🚀 Starting CYBER-EYE Platform Build..."

# Detect which service to build based on environment
if [ "$RENDER_SERVICE_NAME" = "cyber-eye-backend" ]; then
    echo "📡 Building Backend API..."
    cd backend
    pip install -r requirements.txt
    echo "✅ Backend build complete"
    
elif [ "$RENDER_SERVICE_NAME" = "cyber-eye-dashboard" ]; then
    echo "📊 Building Dashboard..."
    cd dashboard
    npm install
    npm run build
    npm install -g serve
    echo "✅ Dashboard build complete"
    
elif [ "$RENDER_SERVICE_NAME" = "xzso-landing" ]; then
    echo "🌐 Building XZSO Landing Page..."
    cd "landing page/xszo-main__1_/xszo-main (1)/xszo-main"
    npm install
    npm run build
    echo "✅ Landing page build complete"
    
else
    echo "🔧 Building all services..."
    
    # Backend
    echo "📡 Building Backend..."
    cd backend && pip install -r requirements.txt && cd ..
    
    # Dashboard
    echo "📊 Building Dashboard..."
    cd dashboard && npm install && npm run build && cd ..
    
    # Landing page
    echo "🌐 Building Landing Page..."
    cd "landing page/xszo-main__1_/xszo-main (1)/xszo-main" && npm install && npm run build && cd ../../../..
    
    echo "✅ All services built successfully"
fi

echo "🎉 Build completed successfully!"