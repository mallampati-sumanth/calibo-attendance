function requireAuth(req, res, next) {
    if (!req.session || !req.session.adminId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session || !req.session.adminId || req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

module.exports = {
    requireAuth,
    requireAdmin
};