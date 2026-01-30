"""
Student Attendance Tracker - Flask Backend
Designed for PythonAnywhere Free Tier with Supabase
"""
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import os
from functools import wraps
from supabase_config import get_supabase_client

app = Flask(__name__, static_folder='frontend', static_url_path='')

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS

Session(app)
CORS(app, supports_credentials=True)

# Initialize Supabase client
supabase = get_supabase_client()

# Authentication decorator
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ============= Routes =============

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# ============= Authentication Routes =============

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password required'}), 400
        
        # Get admin from Supabase
        response = supabase.table('admins').select('*').eq('username', username).execute()
        
        if not response.data:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        admin = response.data[0]
        
        # Verify password
        if not check_password_hash(admin['password_hash'], password):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Create session
        session['admin_id'] = admin['id']
        session['username'] = admin['username']
        
        return jsonify({
            'success': True,
            'admin': {
                'id': admin['id'],
                'username': admin['username'],
                'email': admin['email']
            }
        })
    
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'success': False, 'error': 'Login failed'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    if 'admin_id' in session:
        return jsonify({
            'authenticated': True,
            'admin': {
                'id': session['admin_id'],
                'username': session['username']
            }
        })
    return jsonify({'authenticated': False})

@app.route('/api/admin/change-username', methods=['POST'])
@require_auth
def change_username():
    try:
        data = request.get_json()
        new_username = data.get('new_username')
        password = data.get('password')
        
        if not new_username or not password:
            return jsonify({'success': False, 'error': 'Username and password required'}), 400
        
        if len(new_username) < 3:
            return jsonify({'success': False, 'error': 'Username must be at least 3 characters'}), 400
        
        # Get current admin
        admin_id = session['admin_id']
        response = supabase.table('admins').select('*').eq('id', admin_id).execute()
        
        if not response.data:
            return jsonify({'success': False, 'error': 'Admin not found'}), 404
        
        admin = response.data[0]
        
        # Verify password
        if not check_password_hash(admin['password_hash'], password):
            return jsonify({'success': False, 'error': 'Invalid password'}), 401
        
        # Check if new username already exists
        existing = supabase.table('admins').select('id').eq('username', new_username).execute()
        if existing.data and existing.data[0]['id'] != admin_id:
            return jsonify({'success': False, 'error': 'Username already taken'}), 400
        
        # Update username
        supabase.table('admins').update({
            'username': new_username
        }).eq('id', admin_id).execute()
        
        # Update session
        session['username'] = new_username
        
        return jsonify({'success': True, 'message': 'Username updated successfully'})
        
    except Exception as e:
        print(f"Change username error: {e}")
        return jsonify({'success': False, 'error': 'Failed to update username'}), 500

@app.route('/api/admin/change-password', methods=['POST'])
@require_auth
def change_password():
    try:
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'success': False, 'error': 'Current and new passwords required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'success': False, 'error': 'New password must be at least 6 characters'}), 400
        
        # Get current admin
        admin_id = session['admin_id']
        response = supabase.table('admins').select('*').eq('id', admin_id).execute()
        
        if not response.data:
            return jsonify({'success': False, 'error': 'Admin not found'}), 404
        
        admin = response.data[0]
        
        # Verify current password
        if not check_password_hash(admin['password_hash'], current_password):
            return jsonify({'success': False, 'error': 'Current password is incorrect'}), 401
        
        # Generate new password hash
        new_password_hash = generate_password_hash(new_password)
        
        # Update password
        supabase.table('admins').update({
            'password_hash': new_password_hash
        }).eq('id', admin_id).execute()
        
        return jsonify({'success': True, 'message': 'Password updated successfully'})
        
    except Exception as e:
        print(f"Change password error: {e}")
        return jsonify({'success': False, 'error': 'Failed to update password'}), 500

# ============= Student Routes =============

@app.route('/api/students', methods=['GET'])
@require_auth
def get_students():
    try:
        batch = request.args.get('batch')
        course = request.args.get('course')
        
        query = supabase.table('students').select('*').eq('status', 'active')
        
        if batch:
            query = query.eq('batch', batch)
        if course:
            query = query.eq('course', course)
        
        # Order by KL University first, then by batch and roll number
        response = query.order('batch').order('roll_number').execute()
        
        # Sort to prioritize KL University
        students = sorted(response.data, key=lambda x: (
            0 if x['batch'] == 'KL University' else 1,
            x['batch'],
            x['roll_number']
        ))
        
        return jsonify({'success': True, 'students': students})
    
    except Exception as e:
        print(f"Get students error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/students/stats', methods=['GET'])
@require_auth
def get_student_stats():
    try:
        response = supabase.table('students').select('batch, course').eq('status', 'active').execute()
        students = response.data
        
        # Calculate statistics
        batches = list(set(s['batch'] for s in students))
        courses = list(set(s['course'] for s in students))
        
        # Batch distribution
        by_batch = {}
        for student in students:
            batch = student['batch']
            by_batch[batch] = by_batch.get(batch, 0) + 1
        
        batch_distribution = [{'batch': k, 'count': v} for k, v in by_batch.items()]
        batch_distribution.sort(key=lambda x: (0 if x['batch'] == 'KL University' else 1, x['batch']))
        
        # Course distribution
        by_course = {}
        for student in students:
            course = student['course']
            by_course[course] = by_course.get(course, 0) + 1
        
        course_distribution = [{'course': k, 'count': v} for k, v in by_course.items()]
        
        return jsonify({
            'success': True,
            'batches': batches,
            'courses': courses,
            'byBatch': batch_distribution,
            'byCourse': course_distribution,
            'totalStudents': len(students)
        })
    
    except Exception as e:
        print(f"Get stats error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============= Attendance Routes =============

@app.route('/api/attendance/by-date', methods=['GET'])
@require_auth
def get_attendance_by_date():
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        batch = request.args.get('batch')
        
        # Get all active students
        student_query = supabase.table('students').select('*').eq('status', 'active')
        if batch:
            student_query = student_query.eq('batch', batch)
        
        students_response = student_query.order('roll_number').execute()
        students = students_response.data
        
        # Get attendance records for the date
        attendance_response = supabase.table('attendance').select('*').eq('attendance_date', date).execute()
        attendance_dict = {a['student_id']: a for a in attendance_response.data}
        
        # Combine data
        result = []
        for student in students:
            attendance = attendance_dict.get(student['id'])
            result.append({
                'student_id': student['id'],
                'roll_number': student['roll_number'],
                'first_name': student['first_name'],
                'last_name': student['last_name'],
                'course': student['course'],
                'batch': student['batch'],
                'attendance_date': date,
                'status': attendance['status'] if attendance else None,
                'remarks': attendance['remarks'] if attendance else None,
                'attendance_id': attendance['id'] if attendance else None,
                'marked_at': attendance['marked_at'] if attendance else None
            })
        
        # Sort to prioritize KL University
        result.sort(key=lambda x: (
            0 if x['batch'] == 'KL University' else 1,
            x['batch'],
            x['roll_number']
        ))
        
        return jsonify({'success': True, 'attendance': result})
    
    except Exception as e:
        print(f"Get attendance error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/attendance/mark', methods=['POST'])
@require_auth
def mark_attendance():
    try:
        data = request.get_json()
        attendance_records = data.get('attendance_records', [])
        date = data.get('attendance_date', datetime.now().strftime('%Y-%m-%d'))
        
        if not attendance_records:
            return jsonify({'success': False, 'error': 'No attendance records provided'}), 400
        
        # Get all existing attendance records for this date
        existing_attendance = {}
        try:
            existing_response = supabase.table('attendance').select('*').eq('attendance_date', date).execute()
            for record in existing_response.data:
                existing_attendance[record['student_id']] = record
        except Exception as e:
            print(f"Error fetching existing attendance: {e}")
        
        marked_count = 0
        
        for record in attendance_records:
            try:
                student_id = record['student_id']
                status = record['status']
                remarks = record.get('remarks', '')
                
                # Prepare attendance data
                attendance_data = {
                    'status': status,
                    'remarks': remarks,
                    'marked_by': session['admin_id'],
                    'marked_at': datetime.now().isoformat()
                }
                
                if student_id in existing_attendance:
                    # Update existing record
                    try:
                        existing_id = existing_attendance[student_id]['id']
                        supabase.table('attendance').update(attendance_data).eq('id', existing_id).execute()
                        marked_count += 1
                    except Exception as update_error:
                        print(f"Error updating attendance for student {student_id}: {update_error}")
                else:
                    # Insert new record
                    try:
                        attendance_data['student_id'] = student_id
                        attendance_data['attendance_date'] = date
                        supabase.table('attendance').insert(attendance_data).execute()
                        marked_count += 1
                    except Exception as insert_error:
                        print(f"Error inserting attendance for student {student_id}: {insert_error}")
                
            except Exception as record_error:
                print(f"Error processing record: {record_error}")
                continue
        
        return jsonify({
            'success': True,
            'message': f'Attendance marked for {marked_count} students',
            'count': marked_count
        })
    
    except Exception as e:
        print(f"Mark attendance error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============= Reports Routes =============

@app.route('/api/reports/summary', methods=['GET'])
@require_auth
def get_attendance_summary():
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        batch = request.args.get('batch')
        
        if not start_date or not end_date:
            return jsonify({'success': False, 'error': 'Start and end dates required'}), 400
        
        # Build query
        query = supabase.table('attendance').select(
            'id, student_id, attendance_date, status, students(roll_number, first_name, last_name, batch, course)'
        ).gte('attendance_date', start_date).lte('attendance_date', end_date)
        
        response = query.execute()
        records = response.data
        
        # Filter by batch if specified
        if batch:
            records = [r for r in records if r['students']['batch'] == batch]
        
        # Calculate statistics
        total_records = len(records)
        present_count = sum(1 for r in records if r['status'] == 'present')
        absent_count = sum(1 for r in records if r['status'] == 'absent')
        
        # By date
        by_date = {}
        for record in records:
            date = record['attendance_date']
            if date not in by_date:
                by_date[date] = {'present': 0, 'absent': 0}
            by_date[date][record['status']] += 1
        
        date_wise = [{'date': k, 'present': v['present'], 'absent': v['absent']} 
                     for k, v in sorted(by_date.items())]
        
        return jsonify({
            'success': True,
            'summary': {
                'totalRecords': total_records,
                'presentCount': present_count,
                'absentCount': absent_count,
                'attendanceRate': round((present_count / total_records * 100) if total_records > 0 else 0, 2),
                'dateWise': date_wise
            }
        })
    
    except Exception as e:
        print(f"Get summary error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/reports/daily/<date>', methods=['GET'])
@require_auth
def get_daily_report(date):
    try:
        batch = request.args.get('batch')
        course = request.args.get('course')
        
        # Get attendance for the date
        query = supabase.table('attendance').select(
            '*, students(roll_number, first_name, last_name, batch, course)'
        ).eq('attendance_date', date)
        
        response = query.execute()
        records = response.data
        
        # Filter by batch/course if specified
        if batch:
            records = [r for r in records if r['students'] and r['students']['batch'] == batch]
        if course:
            records = [r for r in records if r['students'] and r['students']['course'] == course]
        
        # Calculate stats
        present = sum(1 for r in records if r['status'] == 'present')
        absent = sum(1 for r in records if r['status'] == 'absent')
        total = len(records)
        percentage = round((present / total * 100) if total > 0 else 0, 1)
        
        # Format student data
        students_data = []
        for record in records:
            if record['students']:
                students_data.append({
                    'roll_number': record['students']['roll_number'],
                    'first_name': record['students']['first_name'],
                    'last_name': record['students']['last_name'],
                    'batch': record['students']['batch'],
                    'course': record['students']['course'],
                    'status': record['status'],
                    'remarks': record.get('remarks', '')
                })
        
        return jsonify({
            'success': True,
            'date': date,
            'batch': batch or 'All',
            'course': course or 'All',
            'stats': {
                'total': total,
                'present': present,
                'absent': absent,
                'percentage': percentage
            },
            'students': students_data
        })
    
    except Exception as e:
        print(f"Get daily report error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/reports/monthly/<int:year>/<int:month>', methods=['GET'])
@require_auth
def get_monthly_report(year, month):
    try:
        batch = request.args.get('batch')
        course = request.args.get('course')
        
        # Calculate date range
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year}-12-31"
        else:
            from calendar import monthrange
            last_day = monthrange(year, month)[1]
            end_date = f"{year}-{month:02d}-{last_day}"
        
        # Get attendance for the month
        query = supabase.table('attendance').select(
            '*, students(roll_number, first_name, last_name, batch, course)'
        ).gte('attendance_date', start_date).lte('attendance_date', end_date)
        
        response = query.execute()
        records = response.data
        
        # Filter by batch/course if specified
        if batch:
            records = [r for r in records if r['students'] and r['students']['batch'] == batch]
        if course:
            records = [r for r in records if r['students'] and r['students']['course'] == course]
        
        # Calculate overall stats
        present = sum(1 for r in records if r['status'] == 'present')
        absent = sum(1 for r in records if r['status'] == 'absent')
        total = len(records)
        percentage = round((present / total * 100) if total > 0 else 0, 1)
        
        # Group by date
        by_date = {}
        for record in records:
            date = record['attendance_date']
            if date not in by_date:
                by_date[date] = {'present': 0, 'absent': 0}
            by_date[date][record['status']] += 1
        
        daily_stats = [
            {
                'date': date,
                'present': stats['present'],
                'absent': stats['absent'],
                'total': stats['present'] + stats['absent'],
                'percentage': round((stats['present'] / (stats['present'] + stats['absent']) * 100) if (stats['present'] + stats['absent']) > 0 else 0, 1)
            }
            for date, stats in sorted(by_date.items())
        ]
        
        return jsonify({
            'success': True,
            'year': year,
            'month': month,
            'batch': batch or 'All',
            'course': course or 'All',
            'stats': {
                'total': total,
                'present': present,
                'absent': absent,
                'percentage': percentage
            },
            'daily': daily_stats
        })
    
    except Exception as e:
        print(f"Get monthly report error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/reports/student/<student_id>', methods=['GET'])
@require_auth
def get_student_report(student_id):
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        # Get student info
        student_response = supabase.table('students').select('*').eq('id', student_id).execute()
        if not student_response.data:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        student = student_response.data[0]
        
        # Get attendance records
        query = supabase.table('attendance').select('*').eq('student_id', student_id)
        if from_date:
            query = query.gte('attendance_date', from_date)
        if to_date:
            query = query.lte('attendance_date', to_date)
        
        response = query.order('attendance_date', desc=True).execute()
        records = response.data
        
        # Calculate stats
        present = sum(1 for r in records if r['status'] == 'present')
        absent = sum(1 for r in records if r['status'] == 'absent')
        total = len(records)
        percentage = round((present / total * 100) if total > 0 else 0, 1)
        
        return jsonify({
            'success': True,
            'student': {
                'id': student['id'],
                'roll_number': student['roll_number'],
                'first_name': student['first_name'],
                'last_name': student['last_name'],
                'batch': student['batch'],
                'course': student['course']
            },
            'stats': {
                'total': total,
                'present': present,
                'absent': absent,
                'percentage': percentage
            },
            'records': records
        })
    
    except Exception as e:
        print(f"Get student report error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============= Dashboard Compatibility Routes =============

@app.route('/api/students/stats/overview', methods=['GET'])
@require_auth
def get_dashboard_student_stats():
    try:
        # Get all active students
        response = supabase.table('students').select('*').eq('status', 'active').execute()
        students = response.data
        
        # Calculate batch distribution
        by_batch = {}
        for student in students:
            batch = student['batch']
            by_batch[batch] = by_batch.get(batch, 0) + 1
        
        batch_distribution = [{'batch': k, 'count': v} for k, v in by_batch.items()]
        batch_distribution.sort(key=lambda x: (0 if x['batch'] == 'KL University' else 1, x['batch']))
        
        return jsonify({
            'total': len(students),
            'byBatch': batch_distribution
        })
    except Exception as e:
        print(f"Dashboard student stats error: {e}")
        return jsonify({'total': 0, 'byBatch': []}), 500

@app.route('/api/attendance/stats/overview', methods=['GET'])
@require_auth
def get_dashboard_attendance_stats():
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Get total active students (denominator)
        students_resp = supabase.table('students').select('id').eq('status', 'active').execute()
        total_students = len(students_resp.data)
        
        # Get attendance for date
        attendance_resp = supabase.table('attendance').select('status').eq('attendance_date', date).execute()
        
        present = sum(1 for r in attendance_resp.data if r['status'] == 'present')
        absent = sum(1 for r in attendance_resp.data if r['status'] == 'absent')
        
        percentage = 0
        if total_students > 0:
            percentage = round((present / total_students) * 100, 1)
            
        return jsonify({
            'present': present,
            'absent': absent,
            'percentage': percentage,
            'total': total_students
        })
    except Exception as e:
        print(f"Dashboard attendance stats error: {e}")
        return jsonify({'present': 0, 'absent': 0, 'percentage': 0}), 500

@app.route('/api/reports/trends', methods=['GET'])
@require_auth
def get_dashboard_trends():
    try:
        days = int(request.args.get('days', 7))
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days-1)
        
        start_str = start_date.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        
        # Get all attendance in range
        response = supabase.table('attendance').select('attendance_date, status') \
            .gte('attendance_date', start_str) \
            .lte('attendance_date', end_str) \
            .execute()
            
        # Group by date
        daily_stats = {}
        # Initialize all dates in range with 0
        curr = start_date
        while curr <= end_date:
            d_str = curr.strftime('%Y-%m-%d')
            daily_stats[d_str] = {'date': d_str, 'present': 0, 'absent': 0}
            curr += timedelta(days=1)
            
        for record in response.data:
            d = record['attendance_date']
            s = record['status']
            if d in daily_stats:
                if s == 'present': daily_stats[d]['present'] += 1
                elif s == 'absent': daily_stats[d]['absent'] += 1
                
        return jsonify(list(daily_stats.values()))
    except Exception as e:
        print(f"Dashboard trends error: {e}")
        return jsonify([]), 500

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(500)
def server_error(e):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # For local development
    app.run(host='0.0.0.0', port=3000, debug=True)

