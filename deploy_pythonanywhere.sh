#!/bin/bash
# Calibo Attendance Tracker - PythonAnywhere Deployment Script
# Run this in PythonAnywhere Bash console

echo "🚀 Starting Calibo Attendance Tracker Deployment..."
echo ""

# Step 1: Navigate to home directory
cd ~
echo "✅ In home directory: $(pwd)"

# Step 2: Create project directory
echo ""
echo "📁 Creating attendance_tracker directory..."
mkdir -p attendance_tracker
cd attendance_tracker
echo "✅ Created and entered: $(pwd)"

# Step 3: Create frontend directory structure
echo ""
echo "📁 Creating frontend folder structure..."
mkdir -p frontend/css
mkdir -p frontend/js
mkdir -p frontend/images
echo "✅ Frontend directories created"

# Step 4: Create virtual environment
echo ""
echo "🐍 Creating virtual environment..."
mkvirtualenv --python=/usr/bin/python3.10 attendance-env
echo "✅ Virtual environment created: attendance-env"

# Step 5: Install dependencies
echo ""
echo "📦 Installing Python packages..."
pip install flask==3.0.0
pip install flask-cors==4.0.0
pip install supabase==2.7.4
pip install gunicorn==21.2.0
pip install python-dotenv==1.0.0
echo "✅ All packages installed"

# Step 6: Check installation
echo ""
echo "🔍 Verifying installations..."
pip list | grep -E "flask|supabase|gunicorn"

# Step 7: Instructions for next steps
echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Upload files to ~/attendance_tracker/"
echo "   - app.py"
echo "   - supabase_config.py"
echo "   - wsgi.py"
echo "   - requirements.txt"
echo ""
echo "2. Upload frontend files:"
echo "   - frontend/index.html"
echo "   - frontend/manifest.json"
echo "   - frontend/service-worker.js"
echo "   - frontend/css/style.css"
echo "   - frontend/js/*.js (all JS files)"
echo "   - frontend/images/* (all icon files)"
echo ""
echo "3. Go to Web tab and configure:"
echo "   - Add new web app (Manual config, Python 3.10)"
echo "   - Set virtualenv: ~/.virtualenvs/attendance-env"
echo "   - Edit WSGI file (see instructions below)"
echo "   - Add static files mapping"
echo "   - Reload web app"
echo ""
echo "=========================================="
echo "📝 WSGI Configuration:"
echo "=========================================="
echo ""
echo "Edit your WSGI file and paste this:"
echo ""
cat << 'EOF'
import sys
import os

# Add project directory
project_home = '/home/sumanth4036189/attendance_tracker'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Environment variables
os.environ['SUPABASE_URL'] = 'https://ztfxwdmbseqrfuqyzrpo.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Znh3ZG1ic2VxcmZ1cXl6cnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTUzNjEsImV4cCI6MjA1MzU3MTM2MX0.jxrPCo5EUXCGkmB-kvXQVHQGS_gXC8Vki7-K3lVxzWI'
os.environ['SECRET_KEY'] = 'calibo-attendance-2026-secure-key'

# Import app
from app import app as application
EOF
echo ""
echo "=========================================="
echo ""
echo "Your app URL: https://sumanth4036189.pythonanywhere.com"
echo ""
echo "Default login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "🎉 Ready to upload files and configure web app!"
