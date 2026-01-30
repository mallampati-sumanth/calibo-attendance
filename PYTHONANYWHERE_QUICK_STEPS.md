# 🚀 PythonAnywhere Deployment - Quick Steps

You're logged into PythonAnywhere! Follow these exact steps:

---

## Step 1: Create Directory for Attendance Tracker

On the **Files** page you're viewing:

1. In **"Directories"** section, type in the box: `attendance_tracker`
2. Click the folder icon to create it
3. Click on `attendance_tracker/` folder to open it

---

## Step 2: Upload Files

Inside the `attendance_tracker` folder, upload these files:

### Main Python Files:
1. Click **"Upload a file"** button
2. Upload these files one by one:
   - `app.py`
   - `supabase_config.py`
   - `requirements.txt`
   - `wsgi.py`

### Frontend Folder:
1. You need to upload the entire `frontend` folder
2. Two options:

**Option A: ZIP and Upload**
- On your computer, ZIP the `frontend` folder
- Upload `frontend.zip`
- Open Bash console and run: `cd attendance_tracker && unzip frontend.zip`

**Option B: Manual Upload**
- Create `frontend` directory
- Go into it and create subdirectories: `css`, `js`, `images`
- Upload files to each folder:
  - `frontend/` → `index.html`, `manifest.json`, `service-worker.js`
  - `frontend/css/` → `style.css`
  - `frontend/js/` → `app.js`, `auth.js`, `dashboard.js`, `attendance.js`, `students.js`, `reports.js`
  - `frontend/images/` → all icon files

---

## Step 3: Open Bash Console

1. Go to **"Consoles"** tab (top menu)
2. Click **"Bash"** to open a new console
3. You'll see a terminal window

---

## Step 4: Create Virtual Environment

In the Bash console, type these commands:

```bash
# Navigate to your project
cd attendance_tracker

# Create virtual environment
mkvirtualenv --python=/usr/bin/python3.10 attendance-env

# Activate it (should auto-activate after creation)
workon attendance-env
```

---

## Step 5: Install Dependencies

Still in Bash console:

```bash
# Install required packages
pip install flask flask-cors supabase gunicorn python-dotenv

# Or use requirements.txt
pip install -r requirements.txt
```

Wait for installation to complete (2-3 minutes).

---

## Step 6: Set Up Web App

1. Go to **"Web"** tab (top menu)
2. Click **"Add a new web app"**
3. Click **"Next"** for free domain
4. Select **"Manual configuration"**
5. Choose **Python 3.10**
6. Click **"Next"**

---

## Step 7: Configure WSGI File

On the Web tab, you'll see **"Code"** section:

1. Click on **WSGI configuration file** (blue link)
   - Example: `/var/www/sumanth4036189_pythonanywhere_com_wsgi.py`
2. Delete ALL existing content
3. Replace with this:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/sumanth4036189/attendance_tracker'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://ztfxwdmbseqrfuqyzrpo.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Znh3ZG1ic2VxcmZ1cXl6cnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTUzNjEsImV4cCI6MjA1MzU3MTM2MX0.jxrPCo5EUXCGkmB-kvXQVHQGS_gXC8Vki7-K3lVxzWI'
os.environ['SECRET_KEY'] = 'calibo-attendance-2026-secure-key'

# Import Flask app
from app import app as application
```

4. Click **"Save"** (top right)

---

## Step 8: Configure Virtual Environment

Back on the Web tab:

1. Find **"Virtualenv"** section
2. Enter: `/home/sumanth4036189/.virtualenvs/attendance-env`
3. Click the checkmark ✓

---

## Step 9: Configure Static Files

On the Web tab, scroll to **"Static files"** section:

1. Click **"Enter URL"** and type: `/`
2. Click **"Enter path"** and type: `/home/sumanth4036189/attendance_tracker/frontend`
3. Click the checkmark ✓

OR

1. URL: `/static`
2. Path: `/home/sumanth4036189/attendance_tracker/frontend`

---

## Step 10: Reload Web App

1. Scroll to top of Web tab
2. Click the big green **"Reload"** button
3. Wait 10-20 seconds

---

## Step 11: Test Your App!

1. Click on your app URL: `https://sumanth4036189.pythonanywhere.com`
2. You should see the login page
3. Login with:
   - Username: `admin`
   - Password: `admin123`

---

## ✅ Success Checklist

- [ ] Files uploaded to `attendance_tracker` folder
- [ ] Virtual environment created and activated
- [ ] Dependencies installed
- [ ] WSGI file configured with Supabase credentials
- [ ] Virtual environment path set
- [ ] Static files mapped to frontend folder
- [ ] Web app reloaded
- [ ] Can access login page
- [ ] Can login successfully
- [ ] Students load correctly
- [ ] Can mark attendance
- [ ] Reports work

---

## 🐛 Troubleshooting

### If you see errors:

1. **Check Error Log:**
   - On Web tab, click **"Error log"** link
   - Look for Python errors

2. **Check Server Log:**
   - On Web tab, click **"Server log"** link
   - Look for startup issues

3. **Common Issues:**

**"No module named 'supabase'"**
```bash
workon attendance-env
pip install supabase
```

**"No module named 'flask'"**
```bash
workon attendance-env
pip install flask flask-cors
```

**"Application object must be callable"**
- Check WSGI file has `from app import app as application`

**Static files not loading**
- Verify path: `/home/sumanth4036189/attendance_tracker/frontend`
- Check Files tab that frontend folder exists

---

## 📱 Install as Mobile App

Once working, users can install on mobile:

**Android:**
- Open URL in Chrome
- Menu → "Install app"

**iPhone:**
- Open in Safari
- Share → "Add to Home Screen"

---

## 🎉 You're Done!

Your attendance tracker is now live at:
**https://sumanth4036189.pythonanywhere.com**

Share this URL with teachers and staff!

**Features:**
✅ Daily attendance marking
✅ Student management
✅ Reports and analytics
✅ CSV export
✅ Mobile app installation
✅ Works 24/7
✅ FREE forever!
