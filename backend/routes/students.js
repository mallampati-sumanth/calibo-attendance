const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth } = require('../middleware/auth');

// Get all students
router.get('/', requireAuth, (req, res) => {
    console.log('👥 Students request received');
    console.log('Query params:', req.query);
    
    const { batch, course, status = 'active' } = req.query;
    
    let query = 'SELECT * FROM students WHERE status = ?';
    let params = [status];

    if (batch) {
        query += ' AND batch = ?';
        params.push(batch);
    }

    if (course) {
        query += ' AND course = ?';
        params.push(course);
    }

    query += ' ORDER BY CASE WHEN batch = "KL University" THEN 0 ELSE 1 END, batch, roll_number';
    console.log('SQL Query:', query);
    console.log('Parameters:', params);

    db.all(query, params, (err, students) => {
        if (err) {
            console.error('❌ Error fetching students:', err);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }
        console.log(`✅ Found ${students.length} students`);
        res.json(students);
    });
});

// Get student by ID
router.get('/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM students WHERE id = ?', [id], (err, student) => {
        if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).json({ error: 'Failed to fetch student' });
        }

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    });
});

// Add new student
router.post('/', requireAuth, (req, res) => {
    const {
        roll_number,
        first_name,
        last_name,
        email,
        phone,
        course,
        batch,
        admission_date
    } = req.body;

    if (!roll_number || !first_name || !last_name) {
        return res.status(400).json({ 
            error: 'Roll number, first name, and last name are required' 
        });
    }

    const query = `
        INSERT INTO students 
        (roll_number, first_name, last_name, email, phone, course, batch, admission_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        roll_number,
        first_name,
        last_name,
        email || null,
        phone || null,
        course || null,
        batch || null,
        admission_date || new Date().toISOString().split('T')[0]
    ];

    db.run(query, params, function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return res.status(400).json({ 
                    error: 'Roll number already exists' 
                });
            }
            console.error('Error adding student:', err);
            return res.status(500).json({ error: 'Failed to add student' });
        }

        db.get('SELECT * FROM students WHERE id = ?', [this.lastID], (err, student) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch added student' });
            }
            res.status(201).json(student);
        });
    });
});

// Update student
router.put('/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const {
        roll_number,
        first_name,
        last_name,
        email,
        phone,
        course,
        batch,
        status
    } = req.body;

    if (!first_name || !last_name) {
        return res.status(400).json({ 
            error: 'First name and last name are required' 
        });
    }

    const query = `
        UPDATE students 
        SET roll_number = ?, first_name = ?, last_name = ?, 
            email = ?, phone = ?, course = ?, batch = ?, status = ?
        WHERE id = ?
    `;

    const params = [
        roll_number,
        first_name,
        last_name,
        email || null,
        phone || null,
        course || null,
        batch || null,
        status || 'active',
        id
    ];

    db.run(query, params, function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return res.status(400).json({ 
                    error: 'Roll number already exists' 
                });
            }
            console.error('Error updating student:', err);
            return res.status(500).json({ error: 'Failed to update student' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        db.get('SELECT * FROM students WHERE id = ?', [id], (err, student) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch updated student' });
            }
            res.json(student);
        });
    });
});

// Delete student (soft delete)
router.delete('/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    db.run(
        'UPDATE students SET status = ? WHERE id = ?',
        ['inactive', id],
        function(err) {
            if (err) {
                console.error('Error deleting student:', err);
                return res.status(500).json({ error: 'Failed to delete student' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json({ success: true, message: 'Student deleted successfully' });
        }
    );
});

// Get student statistics
router.get('/stats/overview', requireAuth, (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM students WHERE status = "active"',
        byBatch: 'SELECT batch, COUNT(*) as count FROM students WHERE status = "active" GROUP BY batch ORDER BY CASE WHEN batch = "KL University" THEN 0 ELSE 1 END, batch',
        byCourse: 'SELECT course, COUNT(*) as count FROM students WHERE status = "active" GROUP BY course'
    };

    const results = {};

    db.get(queries.total, (err, totalResult) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }
        results.total = totalResult.count;

        db.all(queries.byBatch, (err, batchResults) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch batch statistics' });
            }
            results.byBatch = batchResults;

            db.all(queries.byCourse, (err, courseResults) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch course statistics' });
                }
                results.byCourse = courseResults;
                res.json(results);
            });
        });
    });
});

module.exports = router;