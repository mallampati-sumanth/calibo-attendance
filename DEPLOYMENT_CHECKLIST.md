# ✅ Deployment Checklist

Use this checklist to deploy your attendance tracker to the cloud for FREE!

---

## 📋 Pre-Deployment Checklist

- [ ] Read `SETUP_COMPLETE.md` overview
- [ ] Read `DEPLOYMENT_GUIDE.md` detailed instructions
- [ ] Have your Calibo logo ready (`calibo-logo.png`)
- [ ] 15 minutes of free time
- [ ] Internet connection

---

## 🗄️ STEP 1: Supabase Setup (5 minutes)

### Create Account
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up (free, no credit card)
- [ ] Verify email if required

### Create Project
- [ ] Click "New project"
- [ ] Project name: `attendance-tracker`
- [ ] Database password: _________________ (save it!)
- [ ] Region: Select nearest
- [ ] Click "Create project" (wait 2 minutes)

### Run Database Schema
- [ ] Go to SQL Editor (left sidebar)
- [ ] Click "New query"
- [ ] Open file: `supabase_schema.sql`
- [ ] Copy all content
- [ ] Paste in SQL editor
- [ ] Click "Run" button
- [ ] Wait for "Success" message
- [ ] Verify tables created (Tables tab)

### Get Credentials
- [ ] Go to Settings → API
- [ ] Copy Project URL: _________________________________
- [ ] Copy anon public key: _________________________________
- [ ] Save these somewhere safe!

**✅ Supabase setup complete!**

---

## 🐍 STEP 2: PythonAnywhere Deployment (10 minutes)

### Create Account
- [ ] Go to [pythonanywhere.com](https://www.pythonanywhere.com)
- [ ] Click "Pricing & signup"
- [ ] Choose "Create a Beginner account" (FREE)
- [ ] Username: _________________ (save it!)
- [ ] Complete signup

### Upload Files

**Option A: Using Files Tab**
- [ ] Go to Files tab
- [ ] Create directory: `attendance_tracker`
- [ ] Upload these files:
  - [ ] `app.py`
  - [ ] `supabase_config.py`
  - [ ] `requirements.txt`
  - [ ] `wsgi.py`
- [ ] Upload `frontend/` folder:
  - [ ] Create `frontend` directory
  - [ ] Upload `index.html`
  - [ ] Create and upload `css/` folder
  - [ ] Create and upload `js/` folder
  - [ ] Create and upload `images/` folder (with calibo-logo.png)

**Option B: Using Git (if you have a GitHub repo)**
- [ ] Open Bash console
- [ ] Run: `git clone YOUR_REPO_URL attendance_tracker`
- [ ] Run: `cd attendance_tracker`

### Install Dependencies
- [ ] Open Bash console (or use existing)
- [ ] Run: `cd attendance_tracker`
- [ ] Run: `pip3 install --user -r requirements.txt`
- [ ] Wait for installation (30-60 seconds)
- [ ] Verify no errors

### Create Web App
- [ ] Go to Web tab
- [ ] Click "Add a new web app"
- [ ] Click "Next" (for domain name)
- [ ] Select "Manual configuration"
- [ ] Choose "Python 3.10"
- [ ] Click "Next"

### Configure WSGI File
- [ ] In Web tab, find "Code" section
- [ ] Click WSGI configuration file link
- [ ] **DELETE ALL existing content**
- [ ] Open your `wsgi.py` file locally
- [ ] Copy all content
- [ ] Paste in WSGI file
- [ ] Update these lines:
  ```python
  project_home = '/home/YOUR_USERNAME/attendance_tracker'
  os.environ['SUPABASE_URL'] = 'YOUR_SUPABASE_URL'
  os.environ['SUPABASE_KEY'] = 'YOUR_SUPABASE_KEY'
  os.environ['SECRET_KEY'] = 'any-random-string-here'
  ```
- [ ] Replace `YOUR_USERNAME` with your PythonAnywhere username
- [ ] Replace `YOUR_SUPABASE_URL` with URL from Step 1
- [ ] Replace `YOUR_SUPABASE_KEY` with key from Step 1
- [ ] Click "Save" (top right)

### Set Static Files
- [ ] Still in Web tab, scroll to "Static files" section
- [ ] Click "Enter URL" and "Enter path" for each:

**Mapping 1:**
- [ ] URL: `/static/`
- [ ] Path: `/home/YOUR_USERNAME/attendance_tracker/frontend/`

**Mapping 2:**
- [ ] URL: `/css/`
- [ ] Path: `/home/YOUR_USERNAME/attendance_tracker/frontend/css/`

**Mapping 3:**
- [ ] URL: `/js/`
- [ ] Path: `/home/YOUR_USERNAME/attendance_tracker/frontend/js/`

**Mapping 4:**
- [ ] URL: `/images/`
- [ ] Path: `/home/YOUR_USERNAME/attendance_tracker/frontend/images/`

(Replace `YOUR_USERNAME` with your actual PythonAnywhere username)

### Launch App
- [ ] Scroll to top of Web tab
- [ ] Click green "Reload YOUR_USERNAME.pythonanywhere.com" button
- [ ] Wait 10-20 seconds
- [ ] Click the link to your site

**✅ PythonAnywhere deployment complete!**

---

## 🎯 STEP 3: Test Your Application

### Initial Login
- [ ] Visit: `https://YOUR_USERNAME.pythonanywhere.com`
- [ ] You should see login page with Calibo branding
- [ ] Login with:
  - Username: `admin`
  - Password: `admin123`
- [ ] Click "Login"
- [ ] You should see Dashboard

### Test Features
- [ ] **Dashboard**: 
  - [ ] Shows 50 total students
  - [ ] Shows KL University (30) and Diet College (20)
  - [ ] Charts display correctly

- [ ] **Mark Attendance**:
  - [ ] Select "KL University" batch
  - [ ] Select today's date
  - [ ] Click "Load Students"
  - [ ] See 30 students listed
  - [ ] Check/uncheck some boxes (checked = absent)
  - [ ] Click "Save Attendance"
  - [ ] Success message appears

- [ ] **Students**:
  - [ ] See list of all 50 students
  - [ ] KL University students appear first
  - [ ] Can filter by batch

- [ ] **Reports**:
  - [ ] Select date range
  - [ ] Select batch
  - [ ] Generate report
  - [ ] See attendance statistics

- [ ] **Mobile**:
  - [ ] Resize browser window (or test on phone)
  - [ ] Click hamburger menu (☰)
  - [ ] Menu slides in from left
  - [ ] Navigation works
  - [ ] Logo displays correctly

### Test 2x Daily Attendance
- [ ] Mark attendance for KL University
- [ ] Save with remark: "Morning Session"
- [ ] Mark attendance again for same students
- [ ] Save with remark: "Afternoon Session"
- [ ] Both entries saved (check reports)

**✅ All features working!**

---

## 🔒 STEP 4: Security (Optional but Recommended)

### Change Admin Password
- [ ] Open `generate_password_hash.py` locally
- [ ] Run: `python generate_password_hash.py`
- [ ] Enter new password
- [ ] Copy the generated hash
- [ ] Go to Supabase SQL Editor
- [ ] Run:
  ```sql
  UPDATE admins 
  SET password_hash = 'PASTE_HASH_HERE' 
  WHERE username = 'admin';
  ```
- [ ] Test login with new password

### Generate Strong Secret Key
- [ ] In PythonAnywhere Bash:
  ```bash
  python3 -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] Copy the output
- [ ] Edit WSGI config file
- [ ] Replace SECRET_KEY with new value
- [ ] Save and reload app

**✅ Security enhanced!**

---

## 🎨 STEP 5: Finalize Branding

### Upload Calibo Logo
- [ ] Go to PythonAnywhere Files
- [ ] Navigate to: `attendance_tracker/frontend/images/`
- [ ] Upload `calibo-logo.png`
- [ ] Refresh your website
- [ ] Logo appears in navbar and mobile menu

**✅ Branding complete!**

---

## 📊 STEP 6: Verify Everything

### Functional Tests
- [ ] Login/logout works
- [ ] Can mark attendance
- [ ] Can view students
- [ ] Can generate reports
- [ ] Dashboard shows stats
- [ ] Mobile menu works
- [ ] Calibo logo displays

### Data Tests
- [ ] 50 students loaded
- [ ] KL University appears first
- [ ] Diet College data present
- [ ] Attendance saves to database
- [ ] Reports generate correctly

### Performance Tests
- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] Images load properly
- [ ] Forms submit successfully

**✅ All tests passed!**

---

## 🎉 DEPLOYMENT COMPLETE!

### Your Live URLs
- **Application**: `https://YOUR_USERNAME.pythonanywhere.com`
- **Supabase Dashboard**: `https://supabase.com/dashboard`

### Share With Others
Give this URL to:
- [ ] KL University admins
- [ ] Diet College admins
- [ ] Program coordinators
- [ ] Anyone who needs access

### Credentials to Share
- **URL**: `https://YOUR_USERNAME.pythonanywhere.com`
- **Username**: `admin`
- **Password**: (your password)

---

## 🆘 Troubleshooting

### If website shows error:
1. [ ] Check PythonAnywhere error log (Web tab → Error log)
2. [ ] Verify WSGI file has correct paths
3. [ ] Confirm Supabase credentials are correct
4. [ ] Check all static file mappings
5. [ ] Try reloading the web app

### If login doesn't work:
1. [ ] Verify Supabase tables created (go to Supabase → Tables)
2. [ ] Check admins table has data
3. [ ] Confirm password hash is correct
4. [ ] Check browser console for errors

### If students don't load:
1. [ ] Verify supabase_schema.sql ran successfully
2. [ ] Check students table in Supabase has 50 rows
3. [ ] Confirm Supabase RLS policies allow access
4. [ ] Check API credentials in WSGI file

### Still stuck?
- [ ] Read DEPLOYMENT_GUIDE.md troubleshooting section
- [ ] Check PythonAnywhere help: [help.pythonanywhere.com](https://help.pythonanywhere.com)
- [ ] Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)

---

## 📈 Monitoring (Ongoing)

### Weekly
- [ ] Check Supabase usage (Dashboard → Usage)
- [ ] Check PythonAnywhere CPU usage (Account)
- [ ] Verify backups are working

### Monthly
- [ ] Review attendance data
- [ ] Clean up old records if needed
- [ ] Check for any errors in logs

### As Needed
- [ ] Add new students
- [ ] Generate reports
- [ ] Update branding
- [ ] Change passwords

---

## 🎊 Success Metrics

You successfully deployed if:
- ✅ Website is accessible from anywhere
- ✅ Login works
- ✅ Can mark attendance for 2 colleges
- ✅ Can take attendance 2x daily
- ✅ Mobile menu slides from left
- ✅ Calibo branding shows correctly
- ✅ Reports generate properly
- ✅ Total cost: $0.00/month

---

## 📝 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard
**PythonAnywhere Dashboard:** https://www.pythonanywhere.com/user/YOUR_USERNAME/
**Your Application:** https://YOUR_USERNAME.pythonanywhere.com

**Default Credentials:**
- Username: `admin`
- Password: `admin123` (change this!)

**Support Files:**
- Detailed guide: `DEPLOYMENT_GUIDE.md`
- Quick overview: `SETUP_COMPLETE.md`
- What changed: `BEFORE_AFTER_COMPARISON.md`
- File info: `FILE_STRUCTURE.md`

---

**🎉 Congratulations! Your attendance tracker is now live in the cloud!** 🚀

**Cost: $0.00/month | Accessibility: 24/7 | Scalability: Unlimited** ✨
