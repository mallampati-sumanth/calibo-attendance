const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth } = require('../middleware/auth');
const moment = require('moment');

// Mark attendance for multiple students
router.post('/mark', requireAuth, (req, res) => {
    console.log('📝 Attendance marking request received');
    console.log('Request body:', req.body);
    
    const { attendance_date, attendance_records } = req.body;
    const marked_by = req.session.adminId;

    console.log('Date:', attendance_date);
    console.log('Records count:', attendance_records?.length);
    console.log('Marked by:', marked_by);

    if (!attendance_date || !attendance_records || !Array.isArray(attendance_records)) {
        console.log('❌ Validation failed: Missing required data');
        return res.status(400).json({ 
            error: 'Attendance date and records are required' 
        });
    }

    const date = moment(attendance_date).format('YYYY-MM-DD');
    console.log('Formatted date:', date);
    
    // Prepare statement without explicit transaction
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO attendance 
        (student_id, attendance_date, status, marked_by, remarks) 
        VALUES (?, ?, ?, ?, ?)
    `);

    let completedCount = 0;
    let hasError = false;
    let errorMessage = '';

    attendance_records.forEach((record, index) => {
        const { student_id, status, remarks } = record;

        if (!student_id || !status) {
            console.error(`❌ Record ${index} missing student_id or status:`, record);
            hasError = true;
            errorMessage = `Record ${index} missing student_id or status`;
            return;
        }

        stmt.run([student_id, date, status, marked_by, remarks || null], function(err) {
            if (err) {
                console.error('❌ Error marking attendance:', err);
                hasError = true;
                errorMessage = err.message;
            }

            completedCount++;

            // If this is the last record
            if (completedCount === attendance_records.length) {
                stmt.finalize();

                if (hasError) {
                    console.error('❌ Failed to save some records');
                    return res.status(500).json({ 
                        error: 'Failed to mark attendance for some students: ' + errorMessage
                    });
                } else {
                    console.log(`✅ Successfully saved ${completedCount} attendance records`);
                    res.json({ 
                        success: true, 
                        message: `Attendance marked for ${completedCount} students`,
                        date: date
                    });
                }
            }
        });
    });

    if (attendance_records.length === 0) {
        stmt.finalize();
        res.status(400).json({ error: 'No attendance records provided' });
    }
});

// Get attendance for a specific date
router.get('/date/:date', requireAuth, (req, res) => {
    console.log('📅 Attendance by date request received');
    console.log('Date:', req.params.date);
    console.log('Query params:', req.query);
    
    const { date } = req.params;
    const { batch, course } = req.query;

    let query = `
        SELECT 
            a.id as attendance_id,
            s.id as student_id,
            a.attendance_date,
            a.status,
            a.remarks,
            a.marked_at,
            s.roll_number,
            s.first_name,
            s.last_name,
            s.course,
            s.batch
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.attendance_date = ?
        WHERE s.status = 'active'
    `;

    let params = [date];

    if (batch) {
        query += ' AND s.batch = ?';
        params.push(batch);
    }

    if (course) {
        query += ' AND s.course = ?';
        params.push(course);
    }

    query += ' ORDER BY s.roll_number';
    
    console.log('SQL Query:', query);
    console.log('Parameters:', params);

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('❌ Error fetching attendance:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance' });
        }

        console.log(`✅ Found ${rows.length} student records for date ${date}`);
        res.json(rows);
    });
});

// Get attendance for a student in a date range
router.get('/student/:studentId', requireAuth, (req, res) => {
    const { studentId } = req.params;
    const { start_date, end_date } = req.query;

    let query = `
        SELECT 
            a.attendance_date,
            a.status,
            a.remarks,
            a.marked_at
        FROM attendance a
        WHERE a.student_id = ?
    `;

    let params = [studentId];

    if (start_date) {
        query += ' AND a.attendance_date >= ?';
        params.push(start_date);
    }

    if (end_date) {
        query += ' AND a.attendance_date <= ?';
        params.push(end_date);
    }

    query += ' ORDER BY a.attendance_date DESC';

    db.all(query, params, (err, attendance) => {
        if (err) {
            console.error('Error fetching student attendance:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance' });
        }

        // Get student info
        db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, student) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch student info' });
            }

            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json({
                student: student,
                attendance: attendance
            });
        });
    });
});

// Get attendance statistics
router.get('/stats/overview', requireAuth, (req, res) => {
    const { date, start_date, end_date, batch, course } = req.query;

    let baseQuery = `
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE s.status = 'active'
    `;

    let params = [];

    if (date) {
        baseQuery += ' AND a.attendance_date = ?';
        params.push(date);
    } else {
        if (start_date) {
            baseQuery += ' AND a.attendance_date >= ?';
            params.push(start_date);
        }
        if (end_date) {
            baseQuery += ' AND a.attendance_date <= ?';
            params.push(end_date);
        }
    }

    if (batch) {
        baseQuery += ' AND s.batch = ?';
        params.push(batch);
    }

    if (course) {
        baseQuery += ' AND s.course = ?';
        params.push(course);
    }

    const queries = {
        total: `SELECT COUNT(*) as total ${baseQuery}`,
        present: `SELECT COUNT(*) as present ${baseQuery} AND a.status = 'present'`,
        absent: `SELECT COUNT(*) as absent ${baseQuery} AND a.status = 'absent'`,
        byDate: `
            SELECT 
                a.attendance_date,
                COUNT(*) as total,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent
            ${baseQuery}
            GROUP BY a.attendance_date
            ORDER BY a.attendance_date DESC
            LIMIT 30
        `
    };

    const results = {};

    db.get(queries.total, params, (err, totalResult) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch total stats' });
        }
        results.total = totalResult.total;

        db.get(queries.present, params, (err, presentResult) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch present stats' });
            }
            results.present = presentResult.present;

            db.get(queries.absent, params, (err, absentResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch absent stats' });
                }
                results.absent = absentResult.absent;
                results.percentage = results.total > 0 ? 
                    Math.round((results.present / results.total) * 100) : 0;

                db.all(queries.byDate, params, (err, dateResults) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch date stats' });
                    }
                    results.byDate = dateResults.map(row => ({
                        ...row,
                        percentage: row.total > 0 ? 
                            Math.round((row.present / row.total) * 100) : 0
                    }));

                    res.json(results);
                });
            });
        });
    });
});

// Get student-wise attendance summary
router.get('/stats/students', requireAuth, (req, res) => {
    const { start_date, end_date, batch, course } = req.query;

    let query = `
        SELECT 
            s.id,
            s.roll_number,
            s.first_name,
            s.last_name,
            s.batch,
            s.course,
            COUNT(a.id) as total_days,
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        WHERE s.status = 'active'
    `;

    let params = [];

    if (start_date) {
        query += ' AND (a.attendance_date >= ? OR a.attendance_date IS NULL)';
        params.push(start_date);
    }

    if (end_date) {
        query += ' AND (a.attendance_date <= ? OR a.attendance_date IS NULL)';
        params.push(end_date);
    }

    if (batch) {
        query += ' AND s.batch = ?';
        params.push(batch);
    }

    if (course) {
        query += ' AND s.course = ?';
        params.push(course);
    }

    query += `
        GROUP BY s.id, s.roll_number, s.first_name, s.last_name, s.batch, s.course
        ORDER BY s.roll_number
    `;

    db.all(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching student stats:', err);
            return res.status(500).json({ error: 'Failed to fetch student statistics' });
        }

        const studentsWithPercentage = results.map(student => ({
            ...student,
            attendance_percentage: student.total_days > 0 ? 
                Math.round((student.present_days / student.total_days) * 100) : 0
        }));

        res.json(studentsWithPercentage);
    });
});

// Delete attendance record
router.delete('/:attendanceId', requireAuth, (req, res) => {
    const { attendanceId } = req.params;

    db.run(
        'DELETE FROM attendance WHERE id = ?',
        [attendanceId],
        function(err) {
            if (err) {
                console.error('Error deleting attendance:', err);
                return res.status(500).json({ error: 'Failed to delete attendance' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Attendance record not found' });
            }

            res.json({ 
                success: true, 
                message: 'Attendance record deleted successfully' 
            });
        }
    );
});

module.exports = router;