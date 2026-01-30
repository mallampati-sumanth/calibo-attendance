# 🚀 Calibo Attendance Tracker - Deployment Guide

## ✅ **For 6 Months FREE Hosting - Best Options**

Your teacher will login daily, mark attendance, and view reports. Here are the **BEST FREE** options for 6 months:

---

## 🏆 **RECOMMENDED: PythonAnywhere (Best for 6 Months Free)**

### ✅ Why PythonAnywhere:
- **FREE FOREVER** (not just 6 months!)
- 100,000 hits per day (more than enough for daily use)
- No credit card required
- No app sleep/downtime
- App stays active 24/7
- Perfect for daily attendance tracking

### Quick Setup:
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Sign up for FREE account
3. Upload files (see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full steps)
4. Add Supabase credentials
5. Done! Works for 6+ months FREE ✅

**See detailed instructions in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

## ⚡ **Alternative: Render.com (Free with Auto-Sleep)**

### ✅ Why Render:
- Completely free for 6 months
- 750 hours/month (31 days × 24 hours = 744 hours)
- Auto-sleeps after 15 minutes of inactivity
- Wakes up in 30-60 seconds when teacher visits
- Good for daily use (sleeps at night, wakes when needed)

### Important:
- First page load takes 30-60 seconds (after sleep)
- Perfect if teacher uses it once or twice daily
- App will be ready after initial load

### Quick Deploy to Render:

### Step 1: Prepare Your Code
Your code is ready! Just make sure all files are in the `attendance_tracker` folder.

### Step 2: Deploy
1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository OR upload files
4. Settings:
   - **Name**: `calibo-attendance`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   SUPABASE_URL=https://ztfxwdmbseqrfuqyzrpo.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Znh3ZG1ic2VxcmZ1cXl6cnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTUzNjEsImV4cCI6MjA1MzU3MTM2MX0.jxrPCo5EUXCGkmB-kvXQVHQGS_gXC8Vki7-K3lVxzWI
   SECRET_KEY=calibo-attendance-2026-secure-key
   ```

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. Your app will be live at: `https://calibo-attendance.onrender.com`

---

## ✅ Option 2: Deploy to Railway.app

### Step 1: Setup
1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repository

### Step 2: Configure
The `railway.toml` file is already created! Just add environment variables:
```
SUPABASE_URL=https://ztfxwdmbseqrfuqyzrpo.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Znh3ZG1ic2VxcmZ1cXl6cnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTUzNjEsImV4cCI6MjA1MzU3MTM2MX0.jxrPCo5EUXCGkmB-kvXQVHQGS_gXC8Vki7-K3lVxzWI
SECRET_KEY=calibo-attendance-2026-secure-key
```

Railway will auto-deploy! 🎉

---

## 📊 **Free Tier Comparison for 6 Months**

| Service | Free Duration | Daily Use | Downtime | Best For |
|---------|--------------|-----------|----------|----------|
| **PythonAnywhere** | ✅ **Forever** | Perfect | None | **BEST - Daily attendance** |
| **Render** | 6+ months | Good | 30s wake-up | Daily use (sleeps when idle) |
| **Railway** | ~6 months | Perfect | None | Need $5/month after trial |
| **Supabase** | ✅ **Forever** | Perfect | None | Your database (already free!) |

---

## 🎯 **Recommended Setup for Daily Attendance (6 Months Free)**

### **Best Combination:**
- **Backend**: PythonAnywhere (FREE forever, 24/7 active)
- **Database**: Supabase (Already using - FREE forever)
- **Frontend**: Served from PythonAnywhere

### **Why This Works for 6 Months:**
✅ No credit card required
✅ No surprise charges
✅ No app sleep/delays
✅ Teacher can login anytime
✅ View daily reports instantly
✅ Mark attendance quickly
✅ Export CSV anytime
✅ Works on mobile & desktop

---

## 📅 **Usage Pattern for Daily Attendance**

**Morning (9 AM):**
- Teacher logs in
- Marks attendance for students
- Views daily summary

**Afternoon/Evening:**
- Check attendance reports
- Export CSV if needed
- View monthly statistics

**Result:** 
- PythonAnywhere: ✅ Always active, no waiting
- Render: ⏱️ 30-60 second wait if not used for 15 mins
- Railway: ✅ Active but needs payment after free credit

---

## 🔥 **Quick Start (5 Minutes to Deploy)**

### For 6 Months Free - Use PythonAnywhere:

1. **Sign Up**: [pythonanywhere.com/registration](https://www.pythonanywhere.com/registration/register/beginner/)
   - Choose "Beginner" account (FREE)
   - No credit card needed

2. **Upload Files**:
   - Upload `app.py`, `requirements.txt`, `supabase_config.py`
   - Upload entire `frontend` folder

3. **Install Dependencies**:
   ```bash
   pip3 install -r requirements.txt
   ```

4. **Configure**:
   - Add Supabase URL and Key (you already have these!)
   - Set up WSGI file

5. **Done!**
   - Your app is live 24/7
   - Works for 6+ months FREE
   - No downtime

**Full step-by-step guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ✅ Option 2: Deploy to Render.com (Alternative)

## 📱 Install as Mobile App (After Deployment)

Once deployed, users can install your app on their phones:

### On Android:
1. Open the deployed website in Chrome
2. Tap the menu (⋮) → **"Install app"** or **"Add to Home Screen"**
3. App icon will appear on home screen
4. Opens in fullscreen like a native app!

### On iPhone:
1. Open the deployed website in Safari
2. Tap the Share button (□↑)
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. App appears on home screen!

### On Desktop:
1. Open the website in Chrome/Edge
2. Look for install icon in address bar (⊕)
3. Click **"Install"**
4. App opens in its own window!

---

## 🎨 App Icons (Important!)

Before deploying, you need to create app icons. Here's the quick way:

### Option A: Use Icon Generator (Easiest)
1. Go to [realfavicongenerator.net](https://realfavicongenerator.net)
2. U� **Tips for 6 Months FREE Usage**

### To Keep It Free:
1. ✅ Use PythonAnywhere for guaranteed free hosting
2. ✅ Supabase free tier (500MB database) is enough for 1000+ students
3. ✅ Daily attendance uses minimal data
4. ✅ CSV exports don't count against limits
5. ✅ PWA caching reduces server load

### Expected Usage:
- **Daily logins**: 2-3 times/day
- **Attendance records**: ~50-100 per day
- **Database size**: Less than 10MB after 6 months
- **Bandwidth**: Less than 1GB/month

**All within FREE tier limits!** ✅

---

## 🚨 Important: Avoid Costs

### What's FREE Forever:
✅ PythonAnywhere (100K hits/day limit - way more than needed)
✅ Supabase (500MB database - plenty for attendance)
✅ PWA installation (uses browser cache)

### What Might Cost After Free Trial:
⚠️ Render.com (sleeps after 15 mins inactivity - but still FREE)
⚠️ Railway (needs $5/month after free credit)

### Recommendation:
**Use PythonAnywhere + Supabase = FREE for 6+ months (actually forever!)**

---

## 📊 Free Tier Limits

| Service | Storage | Database | Requests/Day | Duration |
|---------|---------|----------|--------------|----------|
| **PythonAnywhere** | 512MB | N/A | 100,000 | ✅ Forever |
| **Render** | 512MB | N/A | Unlimited | ✅ Forever (with sleep) |
| **Railway** | 1GB | N/A | Unlimited | ⏱️ ~6 months (then $5/month) |
| **Supabase** | 500MB DB | 50,000 rows | 2GB transfer | ✅ Forever |

**Your Usage:** ~50 students × 180 days × 2 records = 18,000 records (well within limits!)
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

---

## 🔧 Update Backend URL

After deployment, update the API URL in your frontend:

**Edit `frontend/js/app.js`:**
```javascript
const API_BASE_URL = 'https://your-deployed-app.onrender.com';
```

Replace `https://your-deployed-app.onrender.com` with your actual deployment URL.

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible via HTTPS URL
- [ ] Login works (admin/admin123)
- [ ] Students load correctly
- [ ] Attendance marking works
- [ ] Reports generate properly
- [ ] CSV export works
- [ ] PWA install prompt appears on mobile
- [ ] App works offline (after first load)
- [ ] App icons display correctly

---

## 🎯 Key Features After Deployment

✅ **Installable**: Works like a native mobile app
✅ **Offline Mode**: Service worker caches app for offline use
✅ **Fast Loading**: Cached resources load instantly
✅ **Full Screen**: No browser UI on mobile
✅ **Home Screen Icon**: Users can add to their home screen
✅ **Push Notifications**: (Can be added later if needed)

---

## 🆘 Troubleshooting

### Service Worker Not Registering
- Make sure you're accessing via HTTPS (not HTTP)
- Check browser console for errors
- Clear browser cache and reload

### Icons Not Showing
- Verify icon files exist in `frontend/images/`
- Check manifest.json paths are correct
- Icons must be PNG format

### App Not Installing
- Must be served over HTTPS
- Must have valid manifest.json
- Must have service worker registered
- Check browser supports PWA (Chrome, Edge, Safari)

---

## 📊 Free Tier Limits

| Service | Storage | Bandwidth | Apps |
|---------|---------|-----------|------|
| **Render** | 512MB | No limit | 1 free |
| **Railway** | 1GB | 100GB/month | Multiple |
| **PythonAnywhere** | 512MB | 100K hits/day | 1 free |
| **Supabase** | 500MB DB | 2GB transfer | Unlimited |

All are sufficient for your attendance tracker! 🎉

---

## 🎉 You're Done!

Your attendance tracker is now:
- ✅ Deployed to the cloud
- ✅ Accessible from anywhere
- ✅ Installable as mobile app
- ✅ Works offline
- ✅ 100% FREE to host

**Share the URL with your students and staff!** 📱
