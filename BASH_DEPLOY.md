# 🚀 PythonAnywhere Deployment - Bash Commands

## Quick Deploy with Bash Console

Open **Bash console** in PythonAnywhere and run these commands:

---

## Step 1: Download and Run Setup Script

```bash
# Navigate to home directory
cd ~

# Create attendance_tracker directory
mkdir -p attendance_tracker
cd attendance_tracker

# Create frontend structure
mkdir -p frontend/css frontend/js frontend/images

# Create virtual environment
mkvirtualenv --python=/usr/bin/python3.10 attendance-env

# Install packages
pip install flask==3.0.0 flask-cors==4.0.0 supabase==2.7.4 gunicorn==21.2.0 python-dotenv==1.0.0

echo "✅ Setup complete! Now upload your files."
```

---

## Step 2: Verify Installation

```bash
# Check Python version
python --version

# Check installed packages
pip list | grep -E "flask|supabase|gunicorn"

# Check directory structure
ls -la ~/attendance_tracker/
```

---

## Step 3: After Uploading Files

Once you've uploaded all files via the Files tab, verify:

```bash
# Check files are uploaded
cd ~/attendance_tracker
ls -la

# Should see:
# - app.py
# - supabase_config.py
# - wsgi.py
# - requirements.txt
# - frontend/

# Check frontend files
ls -la frontend/
ls -la frontend/js/
ls -la frontend/css/
```

---

## Step 4: Test App Locally (Optional)

```bash
# Activate virtual environment
workon attendance-env

# Test if app loads
cd ~/attendance_tracker
python -c "from app import app; print('✅ App imports successfully!')"

# Test Supabase connection
python -c "from supabase_config import supabase; print('✅ Supabase connected!')"
```

---

## Step 5: Configure Web App (Use Web UI)

Now go to **Web** tab in PythonAnywhere:

1. **Add new web app**
   - Click "Add a new web app"
   - Next → Manual configuration → Python 3.10

2. **Set Virtual Environment**
   - Virtualenv section: `/home/sumanth4036189/.virtualenvs/attendance-env`

3. **Edit WSGI File**
   - Click WSGI configuration file link
   - Replace ALL content with:

```python
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
```

4. **Add Static Files Mapping**
   - URL: `/`
   - Directory: `/home/sumanth4036189/attendance_tracker/frontend`

5. **Reload**
   - Click green "Reload" button

---

## Step 6: Check Logs (If Errors)

```bash
# View error log
tail -f ~/.local/share/pythonanywhere/error.log

# Or check web app logs via Web tab:
# - Click "Error log" link
# - Click "Server log" link
```

---

## Quick Commands Reference

```bash
# Activate virtual environment
workon attendance-env

# Deactivate virtual environment
deactivate

# List virtual environments
lsvirtualenv

# Install package
pip install package_name

# List installed packages
pip list

# Check Python path
python -c "import sys; print('\n'.join(sys.path))"

# Navigate to project
cd ~/attendance_tracker

# Check disk usage
du -sh ~/attendance_tracker/

# List files recursively
find ~/attendance_tracker -type f

# Check if app.py exists
test -f ~/attendance_tracker/app.py && echo "✅ app.py exists" || echo "❌ app.py missing"
```

---

## Troubleshooting Commands

```bash
# Fix permissions
chmod 755 ~/attendance_tracker
chmod 644 ~/attendance_tracker/*.py

# Reinstall dependencies
workon attendance-env
pip install --upgrade -r requirements.txt

# Clear Python cache
find ~/attendance_tracker -type d -name __pycache__ -exec rm -rf {} +

# Check Python import paths
python -c "import sys; print(sys.path)"

# Test Supabase connection
python -c "
import os
os.environ['SUPABASE_URL'] = 'https://ztfxwdmbseqrfuqyzrpo.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Znh3ZG1ic2VxcmZ1cXl6cnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTUzNjEsImV4cCI6MjA1MzU3MTM2MX0.jxrPCo5EUXCGkmB-kvXQVHQGS_gXC8Vki7-K3lVxzWI'
from supabase import create_client
supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])
print('✅ Supabase connected!')
"
```

---

## Complete One-Command Setup

Copy and paste this entire block into Bash console:

```bash
cd ~ && \
mkdir -p attendance_tracker/frontend/{css,js,images} && \
cd attendance_tracker && \
mkvirtualenv --python=/usr/bin/python3.10 attendance-env && \
pip install flask==3.0.0 flask-cors==4.0.0 supabase==2.7.4 gunicorn==21.2.0 python-dotenv==1.0.0 && \
echo "" && \
echo "========================================" && \
echo "✅ SETUP COMPLETE!" && \
echo "========================================" && \
echo "" && \
echo "Now upload your files to:" && \
echo "  ~/attendance_tracker/" && \
echo "" && \
echo "Then configure Web app:" && \
echo "  1. Add new web app (Python 3.10)" && \
echo "  2. Set virtualenv: ~/.virtualenvs/attendance-env" && \
echo "  3. Edit WSGI file" && \
echo "  4. Add static files mapping" && \
echo "  5. Reload" && \
echo "" && \
echo "Your URL: https://sumanth4036189.pythonanywhere.com" && \
echo ""
```

---

## ✅ Checklist

After running bash commands:

- [ ] Virtual environment created
- [ ] Packages installed
- [ ] Directories created
- [ ] Files uploaded via Files tab
- [ ] Web app added
- [ ] WSGI configured
- [ ] Static files mapped
- [ ] Web app reloaded
- [ ] Can access URL
- [ ] Login works

---

## 🎉 Done!

Your app is now live at: **https://sumanth4036189.pythonanywhere.com**

Login with:
- Username: `admin`
- Password: `admin123`
