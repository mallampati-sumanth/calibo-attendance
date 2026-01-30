# Student Attendance Tracker - Deployment Guide

## 📋 Complete Setup Guide for FREE Hosting

This guide will help you deploy your attendance tracker using **Supabase (Free Tier)** for database and **PythonAnywhere (Free Tier)** for hosting - **100% FREE!**

---

## 🗄️ STEP 1: Setup Supabase Database (FREE)

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google (free)
4. Create a new project:
   - **Project Name**: `attendance-tracker`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to you
   - **Plan**: Free tier (500MB database, 50,000 monthly active users)

### 1.2 Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content of `supabase_schema.sql`
4. Paste it in the SQL editor
5. Click **Run** to create all tables

### 1.3 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
3. Save these - you'll need them!

---

## 🐍 STEP 2: Deploy to PythonAnywhere (FREE)

### 2.1 Create PythonAnywhere Account
1. Go to [https://www.pythonanywhere.com](https://www.pythonanywhere.com)
2. Click **Pricing & signup**
3. Choose **Create a Beginner account** (FREE)
4. Complete signup

### 2.2 Upload Your Code

#### Option A: Using Git (Recommended)
1. Create a GitHub repository with your code
2. In PythonAnywhere, open **Bash console**
3. Run:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git attendance_tracker
cd attendance_tracker
```

#### Option B: Manual Upload
1. Go to **Files** tab in PythonAnywhere
2. Create folder: `attendance_tracker`
3. Upload all files:
   - `app.py`
   - `supabase_config.py`
   - `requirements.txt`
   - `wsgi.py`
   - `frontend/` folder (entire folder with all files)

### 2.3 Install Dependencies
1. Open **Bash console** in PythonAnywhere
2. Run:
```bash
cd attendance_tracker
pip3 install --user -r requirements.txt
```

### 2.4 Configure Web App
1. Go to **Web** tab
2. Click **Add a new web app**
3. Choose:
   - **Python Web Framework**: Manual configuration
   - **Python version**: Python 3.10
4. Click **Next**

### 2.5 Edit WSGI Configuration
1. In **Web** tab, find **Code** section
2. Click on **WSGI configuration file** link
3. **DELETE ALL** existing content
4. Replace with content from your `wsgi.py` file
5. **IMPORTANT**: Update these lines:
```python
# Change YOUR_USERNAME to your PythonAnywhere username
project_home = '/home/YOUR_USERNAME/attendance_tracker'

# Add your Supabase credentials
os.environ['SUPABASE_URL'] = 'https://your-project.supabase.co'  # From Step 1.3
os.environ['SUPABASE_KEY'] = 'your-anon-key'  # From Step 1.3
os.environ['SECRET_KEY'] = 'random-secret-key-generate-one'  # Any random string
```
6. Click **Save**

### 2.6 Set Static Files
1. Still in **Web** tab, find **Static files** section
2. Click **Add a new static file mapping**
3. Add these mappings:

| URL | Directory |
|-----|-----------|
| `/static/` | `/home/YOUR_USERNAME/attendance_tracker/frontend/` |
| `/css/` | `/home/YOUR_USERNAME/attendance_tracker/frontend/css/` |
| `/js/` | `/home/YOUR_USERNAME/attendance_tracker/frontend/js/` |
| `/images/` | `/home/YOUR_USERNAME/attendance_tracker/frontend/images/` |

(Replace `YOUR_USERNAME` with your PythonAnywhere username)

### 2.7 Reload and Test
1. Scroll to top of **Web** tab
2. Click **Reload YOUR_USERNAME.pythonanywhere.com**
3. Wait 10-20 seconds
4. Click the link to your site!

---

## 🎯 STEP 3: Access Your Application

Your app will be live at:
```
https://YOUR_USERNAME.pythonanywhere.com
```

**Login credentials:**
- Username: `admin`
- Password: `admin123`

---

## 🎨 STEP 4: Add Calibo Logo

1. Go to PythonAnywhere **Files** tab
2. Navigate to: `attendance_tracker/frontend/images/`
3. Upload your `calibo-logo.png` image
4. Reload your web app

---

## ✅ What You Get (100% FREE)

### Supabase Free Tier:
- ✅ 500MB database storage
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ Social OAuth providers
- ✅ Auto-generated APIs

### PythonAnywhere Free Tier:
- ✅ 512MB disk space
- ✅ One web app
- ✅ HTTPS enabled
- ✅ Daily automatic backups
- ✅ 100 seconds CPU time/day

---

## 🔧 Troubleshooting

### Error: "Module not found"
```bash
cd ~/attendance_tracker
pip3 install --user -r requirements.txt
```

### Error: "Cannot find module app"
Check your `wsgi.py` file - ensure the path is correct:
```python
project_home = '/home/YOUR_USERNAME/attendance_tracker'
```

### Error: "Supabase connection failed"
Verify in `wsgi.py`:
- SUPABASE_URL is correct
- SUPABASE_KEY is the **anon public** key (not service role key)

### Website shows "Something went wrong"
1. Go to **Web** tab
2. Click **Error log** (red button at top)
3. Check the error message
4. Fix the issue and **Reload** the app

### Check Logs
```bash
# In PythonAnywhere Bash console
tail -f /var/log/YOUR_USERNAME.pythonanywhere.com.error.log
```

---

## 📊 Daily Attendance Tracking (2 Times)

Your app supports taking attendance **2 times per day** for both colleges:

1. **Morning Session**: 
   - Mark attendance for KL University students
   - Mark attendance for Diet College students

2. **Afternoon Session**:
   - Mark attendance again for both colleges
   - System allows multiple attendance entries per day

To track sessions, add a `session` field in remarks:
- "Morning" or "Afternoon"
- Or use different times (marked_at timestamp)

---

## 🔐 Security Best Practices

1. **Change Default Password**:
   - Login to app
   - Go to Supabase SQL Editor
   - Update admin password:
   ```sql
   UPDATE admins SET password_hash = 'new-hash' WHERE username = 'admin';
   ```
   - Generate hash using: `werkzeug.security.generate_password_hash('new-password')`

2. **Use Strong SECRET_KEY**:
   - Generate random string: `python3 -c "import secrets; print(secrets.token_hex(32))"`
   - Update in `wsgi.py`

3. **Enable Supabase RLS Policies**:
   - Already configured in schema
   - Review policies in Supabase Dashboard

---

## 📈 Monitoring & Maintenance

### Check Database Usage:
1. Supabase Dashboard → Settings → Usage

### Check Hosting Usage:
1. PythonAnywhere → Account → Usage

### Backup Data:
1. Supabase Dashboard → Database → Backups (automatic daily backups included!)

---

## 🆘 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **PythonAnywhere Help**: https://help.pythonanywhere.com
- **Flask Docs**: https://flask.palletsprojects.com

---

## 🚀 You're All Set!

Your attendance tracker is now:
- ✅ Live on the internet
- ✅ Using cloud database
- ✅ Completely FREE
- ✅ Ready for 2 colleges
- ✅ Support for 2 daily sessions

**Total Cost: $0.00/month** 🎉
