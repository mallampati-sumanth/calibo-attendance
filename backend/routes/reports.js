const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth } = require('../middleware/auth');
const moment = require('moment');
const { Parser } = require('json2csv');

// Generate monthly attendance report
router.get('/monthly/:month/:year', requireAuth, (req, res) => {
    const { month, year } = req.params;
    const { batch, course } = req.query;

    console.log('📊 Monthly report requested:', { month, year, batch, course });

    const startDate = moment(`${year}-${month.padStart(2, '0')}-01`).format('YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    console.log('Date range:', { startDate, endDate });

    let query = `
        SELECT 
            s.id,
            s.roll_number,
            s.first_name,
            s.last_name,
            s.batch,
            s.course,
            COUNT(a.id) as total_marked_days,
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id 
            AND a.attendance_date BETWEEN ? AND ?
        WHERE s.status = 'active'
    `;

    let params = [startDate, endDate];

    if (batch) {
        query += ' AND s.batch = ?';
        params.push(batch);
    }

    if (course) {
        query += ' AND s.course = ?';
        params.push(course);
    }

    query += ' GROUP BY s.id ORDER BY s.roll_number';

    db.all(query, params, (err, results) => {
        if (err) {
            console.error('Error generating monthly report:', err);
            return res.status(500).json({ error: 'Failed to generate report' });
        }

        // Get total working days in the month
        db.get(
            'SELECT COUNT(DISTINCT attendance_date) as working_days FROM attendance WHERE attendance_date BETWEEN ? AND ?',
            [startDate, endDate],
            (err, workingDaysResult) => {
                if (err) {
                    console.error('Error fetching working days:', err);
                    return res.status(500).json({ error: 'Failed to calculate working days' });
                }

                const workingDays = workingDaysResult.working_days || 0;
                
                const reportData = results.map(student => ({
                    ...student,
                    attendance_percentage: student.total_marked_days > 0 ? 
                        Math.round((student.present_days / student.total_marked_days) * 100) : 0,
                    working_days: workingDays
                }));

                res.json({
                    month: parseInt(month),
                    year: parseInt(year),
                    working_days: workingDays,
                    students: reportData,
                    summary: {
                        total_students: reportData.length,
                        avg_attendance: reportData.length > 0 ? 
                            Math.round(reportData.reduce((sum, s) => sum + s.attendance_percentage, 0) / reportData.length) : 0
                    }
                });
            }
        );
    });
});

// Export monthly report as CSV
router.get('/export/monthly/:month/:year', requireAuth, (req, res) => {
    const { month, year } = req.params;
    const { batch, course, format = 'csv' } = req.query;

    const startDate = moment(`${year}-${month.padStart(2, '0')}-01`).format('YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    let query = `
        SELECT 
            s.roll_number as "Roll Number",
            s.first_name as "First Name",
            s.last_name as "Last Name",
            s.batch as "Batch",
            s.course as "Course",
            COUNT(a.id) as "Total Days",
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as "Present",
            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as "Absent",
            ROUND(
                CASE 
                    WHEN COUNT(a.id) > 0 THEN 
                        (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0) / COUNT(a.id)
                    ELSE 0 
                END, 2
            ) as "Attendance %"
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id 
            AND a.attendance_date BETWEEN ? AND ?
        WHERE s.status = 'active'
    `;

    let params = [startDate, endDate];

    if (batch) {
        query += ' AND s.batch = ?';
        params.push(batch);
    }

    if (course) {
        query += ' AND s.course = ?';
        params.push(course);
    }

    query += ' GROUP BY s.id ORDER BY s.roll_number';

    db.all(query, params, (err, results) => {
        if (err) {
            console.error('Error exporting report:', err);
            return res.status(500).json({ error: 'Failed to export report' });
        }

        if (format === 'csv') {
            try {
                const csv = new Parser().parse(results);
                const filename = `attendance_report_${year}_${month.padStart(2, '0')}.csv`;
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(csv);
            } catch (error) {
                console.error('Error generating CSV:', error);
                res.status(500).json({ error: 'Failed to generate CSV' });
            }
        } else {
            res.json(results);
        }
    });
});

// Get daily attendance report for a specific date
router.get('/daily/:date', requireAuth, (req, res) => {
    const { date } = req.params;
    const { batch, course } = req.query;

    console.log('📅 Daily report requested:', { date, batch, course });

    let query = `
        SELECT 
            s.roll_number,
            s.first_name,
            s.last_name,
            s.batch,
            s.course,
            COALESCE(a.status, 'not_marked') as status,
            a.remarks,
            a.marked_at
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

    db.all(query, params, (err, results) => {
        if (err) {
            console.error('Error generating daily report:', err);
            return res.status(500).json({ error: 'Failed to generate daily report' });
        }

        const summary = {
            total: results.length,
            present: results.filter(r => r.status === 'present').length,
            absent: results.filter(r => r.status === 'absent').length,
            not_marked: results.filter(r => r.status === 'not_marked').length
        };

        summary.attendance_percentage = summary.total > 0 ? 
            Math.round((summary.present / (summary.present + summary.absent)) * 100) || 0 : 0;

        res.json({
            date: date,
            students: results,
            summary: summary
        });
    });
});

// Export daily attendance report
router.get('/export/daily/:date', requireAuth, (req, res) => {
    const { date } = req.params;
    const { batch, course } = req.query;

    let query = `
        SELECT 
            s.roll_number as "Roll Number",
            s.first_name as "First Name",
            s.last_name as "Last Name",
            s.batch as "Batch",
            s.course as "Course",
            COALESCE(a.status, 'not_marked') as "Status",
            a.remarks as "Remarks"
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

    db.all(query, params, (err, results) => {
        if (err) {
            console.error('Error exporting daily report:', err);
            return res.status(500).json({ error: 'Failed to export daily report' });
        }

        try {
            const csv = new Parser().parse(results);
            const filename = `daily_attendance_${date}.csv`;
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csv);
        } catch (error) {
            console.error('Error generating CSV:', error);
            res.status(500).json({ error: 'Failed to generate CSV' });
        }
    });
});

// Get student attendance history
router.get('/student/:studentId/history', requireAuth, (req, res) => {
    const { studentId } = req.params;
    const { start_date, end_date } = req.query;

    console.log('👤 Student history requested:', { studentId, start_date, end_date });

    // Get student info first
    db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, student) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch student info' });
        }

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        let query = `
            SELECT 
                attendance_date,
                status,
                remarks,
                marked_at
            FROM attendance
            WHERE student_id = ?
        `;

        let params = [studentId];

        if (start_date) {
            query += ' AND attendance_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND attendance_date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY attendance_date DESC';

        db.all(query, params, (err, attendance) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch attendance history' });
            }

            const summary = {
                total_days: attendance.length,
                present_days: attendance.filter(a => a.status === 'present').length,
                absent_days: attendance.filter(a => a.status === 'absent').length
            };

            summary.attendance_percentage = summary.total_days > 0 ? 
                Math.round((summary.present_days / summary.total_days) * 100) : 0;

            res.json({
                student: student,
                attendance: attendance,
                summary: summary,
                period: {
                    start_date: start_date,
                    end_date: end_date
                }
            });
        });
    });
});

// Get attendance trends
router.get('/trends', requireAuth, (req, res) => {
    const { days = 30, batch, course } = req.query;

    let query = `
        SELECT 
            a.attendance_date,
            COUNT(*) as total,
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE s.status = 'active'
    `;

    let params = [];

    if (batch) {
        query += ' AND s.batch = ?';
        params.push(batch);
    }

    if (course) {
        query += ' AND s.course = ?';
        params.push(course);
    }

    query += ` 
        GROUP BY a.attendance_date
        ORDER BY a.attendance_date DESC
        LIMIT ?
    `;

    params.push(parseInt(days));

    db.all(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching trends:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance trends' });
        }

        const trends = results.map(row => ({
            ...row,
            attendance_percentage: row.total > 0 ? 
                Math.round((row.present / row.total) * 100) : 0
        }));

        res.json(trends);
    });
});

module.exports = router;