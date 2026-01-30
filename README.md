# Student Attendance Tracker - FREE Cloud Edition

A modern student attendance tracking system with **100% FREE deployment** using Supabase and PythonAnywhere.

## 🌟 Features

- **2 Colleges**: KL University (30 students) + Diet College (20 students)
- **2x Daily Attendance**: Support for morning & afternoon sessions
- **Mobile Responsive**: Slide-in menu from left on mobile
- **Real-time Analytics**: Dashboard with attendance statistics
- **Batch Management**: Organize by college and course
- **Date-range Reports**: Generate and export reports
- **Calibo Branding**: Dark blue theme (#1e3a8a) with logo
- **100% FREE Hosting**: Supabase + PythonAnywhere

## 💰 Total Cost: $0.00/month

### What's Included (FREE):
- **Supabase**: 500MB PostgreSQL database, 50K users
- **PythonAnywhere**: 512MB storage, HTTPS enabled
- **No Credit Card Required**

## 🚀 Quick Start (5 Minutes)

### Local Development

1. **Clone and Install**
   ```bash
   cd attendance_tracker
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run init-db
   ```

3. **Start the Application**
   ```bash
   npm start
   # For development: npm run dev
   ```

4. **Access the Application**
   - Open: http://localhost:3000
   - Default login: **admin** / **admin123**
   - ⚠️ **Change the default password after first login!**

## 📦 Deployment

### Option 1: Railway (Recommended - FREE for 6+ months)

1. **Create Railway Account**: [railway.app](https://railway.app)
2. **Connect GitHub**: Link your repository
3. **Deploy**: One-click deployment
4. **Environment Variables**: Set `SESSION_SECRET` in Railway dashboard

**Cost**: $5 monthly credit = 3-6+ months free for daily usage ✅

### Option 2: Render (FREE with auto-sleep)

1. **Create Render Account**: [render.com](https://render.com)
2. **New Web Service**: Connect your GitHub repo
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

### Option 3: Fly.io

1. **Install Fly CLI**: [fly.io/docs/getting-started](https://fly.io/docs/getting-started/)
2. **Login and Deploy**:
   ```bash
   flyctl auth login
   flyctl launch
   ```

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite (file-based, no external DB needed)
- **Frontend**: HTML5 + Bootstrap 5 + Vanilla JavaScript
- **Authentication**: bcrypt + Express sessions
- **Export**: CSV reports

## 📊 Default Setup

- **Sample Data**: 10 students pre-loaded
- **Admin Account**: admin/admin123
- **Batches**: Batch-2024-A, Batch-2024-B
- **Courses**: Full Stack Development, Data Science

## 🔧 Configuration

### Environment Variables

```bash
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-here
PORT=3000
```

### Database Location

- **Development**: `backend/data/attendance.db`
- **Production**: Automatically created on first run

## 📱 Mobile Support

The application is fully responsive and optimized for:
- ✅ Mobile phones (attendance marking on-the-go)
- ✅ Tablets (perfect for classroom use)
- ✅ Desktop computers (full admin features)

## 🎯 Usage Workflow

1. **Daily Attendance**:
   - Login as admin
   - Navigate to "Mark Attendance"
   - Select date and batch/course
   - Mark Present/Absent for each student
   - Save attendance

2. **Generate Reports**:
   - Go to "Reports" section
   - Choose Monthly, Daily, or Student-specific reports
   - Export as CSV for sharing

3. **Student Management**:
   - Add new students as needed
   - Update student information
   - Manage batches and courses

## 📈 Analytics Features

- **Attendance Percentage**: Per student and overall class
- **Trends**: Visual charts showing attendance patterns
- **Monthly Summary**: Comprehensive monthly reports
- **Export Options**: CSV downloads for external analysis

## 🔒 Security Features

- Secure password hashing (bcrypt)
- Session-based authentication
- Rate limiting protection
- SQL injection prevention
- XSS protection with Helmet.js

## 🆘 Troubleshooting

### Common Issues

1. **Database not found**:
   ```bash
   npm run init-db
   ```

2. **Permission errors**:
   - Ensure write permissions in the app directory

3. **Login issues**:
   - Default: admin/admin123
   - Reset by running `npm run init-db`

### Support

For issues or questions:
1. Check the browser console for errors
2. Review server logs
3. Ensure all dependencies are installed

## 📄 License

MIT License - Feel free to use for educational purposes.

## 🎓 Perfect For

- ✅ Training Institutes
- ✅ Coaching Centers  
- ✅ Small Schools
- ✅ Workshop Management
- ✅ Course Tracking

---

**Ready for Production Use** 🚀

Built with ❤️ for educational institutes worldwide.