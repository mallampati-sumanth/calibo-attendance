const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database/init');

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        db.get(
            'SELECT * FROM admins WHERE username = ? OR email = ?',
            [username, username],
            async (err, admin) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!admin) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const isValidPassword = await bcrypt.compare(password, admin.password_hash);
                
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Update last login
                db.run(
                    'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                    [admin.id]
                );

                // Set session
                req.session.adminId = admin.id;
                req.session.username = admin.username;
                req.session.role = 'admin';

                res.json({
                    success: true,
                    message: 'Login successful',
                    admin: {
                        id: admin.id,
                        username: admin.username,
                        email: admin.email
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check authentication status
router.get('/check', (req, res) => {
    if (req.session && req.session.adminId) {
        res.json({
            authenticated: true,
            admin: {
                id: req.session.adminId,
                username: req.session.username
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Change password route
router.post('/change-password', async (req, res) => {
    if (!req.session || !req.session.adminId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    try {
        db.get(
            'SELECT password_hash FROM admins WHERE id = ?',
            [req.session.adminId],
            async (err, admin) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!admin) {
                    return res.status(404).json({ error: 'Admin not found' });
                }

                const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
                
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Current password is incorrect' });
                }

                const newPasswordHash = await bcrypt.hash(newPassword, 10);

                db.run(
                    'UPDATE admins SET password_hash = ? WHERE id = ?',
                    [newPasswordHash, req.session.adminId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to update password' });
                        }

                        res.json({ 
                            success: true, 
                            message: 'Password changed successfully' 
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = router;