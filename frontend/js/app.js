// Main Application Controller
class AttendanceApp {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        // Check authentication status
        await this.checkAuth();
        
        if (this.isAuthenticated) {
            this.initApp();
        } else {
            this.showLogin();
        }
    }

    async checkAuth() {
        try {
            const response = await this.api('/api/auth/check');
            const data = await response.json();
            
            if (data.authenticated) {
                this.isAuthenticated = true;
                this.currentUser = data.admin;
                this.updateUserDisplay();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    initApp() {
        this.hideLogin();
        this.bindEvents();
        this.showSection('dashboard');
        this.loadInitialData();
    }

    bindEvents() {
        // Navigation events
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').dataset.section;
                this.showSection(section);
            });
        });

        // Logout event
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
        
        // Mobile logout event
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Mobile navigation
        this.setupMobileNavigation();
    }

    setupMobileNavigation() {
        // Navigation is now handled by Bootstrap offcanvas with data-bs-dismiss="offcanvas"
        // No additional JavaScript needed for closing
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('d-none');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('d-none');
            this.currentSection = sectionName;
        }

        // Update navigation
        this.updateNavigation(sectionName);

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    updateNavigation(activeSection) {
        document.querySelectorAll('[data-section]').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${activeSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                if (window.dashboard) {
                    await window.dashboard.loadDashboardData();
                }
                break;
            case 'attendance':
                if (window.attendanceManager) {
                    await window.attendanceManager.init();
                }
                break;
            case 'reports':
                if (window.reportsManager) {
                    // Populate dropdowns when reports section is shown
                    await window.reportsManager.populateDropdowns();
                }
                break;
            case 'students':
                if (window.studentsManager) {
                    await window.studentsManager.loadStudents();
                }
                break;
        }
    }

    async loadInitialData() {
        try {
            // Load common data needed across sections
            await this.loadBatchesAndCourses();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showAlert('Failed to load application data', 'danger');
        }
    }

    async loadBatchesAndCourses() {
        try {
            const studentsResponse = await this.api('/api/students');
            const data = await studentsResponse.json();
            
            // Handle both array/wrapped response format
            const students = Array.isArray(data) ? data : (data.students || []);

            if (!Array.isArray(students)) {
                 console.warn("Expected students array, got:", students);
                 return;
            }
            
            const batches = [...new Set(students.map(s => s.batch).filter(Boolean))];
            const courses = [...new Set(students.map(s => s.course).filter(Boolean))];
            
            // Update all batch selectors (courses removed as per user requirements)
            this.populateSelectOptions('attendance-batch', batches);
            this.populateSelectOptions('report-batch', batches);
            this.populateSelectOptions('daily-report-batch', batches);
            this.populateSelectOptions('filter-batch', batches);
            
            // Store for global use
            window.appData = { batches, courses, students };
        } catch (error) {
            console.error('Failed to load batches and courses:', error);
        }
    }

    populateSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Keep the first option (usually "All" or "Select")
        const firstOption = select.children[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    showLogin() {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }

    hideLogin() {
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }
    }

    updateUserDisplay() {
        if (this.currentUser) {
            document.getElementById('username-display').textContent = this.currentUser.username;
            // Update mobile username display
            const mobileUsernameDisplay = document.getElementById('mobile-username-display');
            if (mobileUsernameDisplay) {
                mobileUsernameDisplay.textContent = this.currentUser.username;
            }
        }
    }

    async logout() {
        try {
            const response = await this.api('/api/auth/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                this.isAuthenticated = false;
                this.currentUser = null;
                window.location.reload();
            }
        } catch (error) {
            console.error('Logout failed:', error);
            this.showAlert('Logout failed', 'danger');
        }
    }

    // Utility methods
    async api(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            this.isAuthenticated = false;
            this.showLogin();
            throw new Error('Authentication required');
        }
        
        return response;
    }

    showAlert(message, type = 'info', duration = 5000) {
        // Create alert element
        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; max-width: 400px;" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-dismiss after duration
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, duration);
    }

    showSpinner() {
        document.getElementById('loading-spinner').classList.remove('d-none');
    }

    hideSpinner() {
        document.getElementById('loading-spinner').classList.add('d-none');
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    formatDateTime(datetime) {
        return new Date(datetime).toLocaleString();
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global utilities
window.utils = {
    formatPercentage: (value) => `${Math.round(value)}%`,
    
    getAttendanceColor: (percentage) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    },
    
    downloadCSV: (data, filename) => {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },
    
    exportTableToCSV: (tableId, filename) => {
        const table = document.getElementById(tableId);
        const rows = Array.from(table.rows);
        
        const csv = rows.map(row => {
            const cells = Array.from(row.cells);
            return cells.map(cell => {
                let text = cell.textContent.trim();
                // Escape quotes and wrap in quotes if contains comma
                if (text.includes(',') || text.includes('"')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                return text;
            }).join(',');
        }).join('\n');
        
        window.utils.downloadCSV(csv, filename);
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AttendanceApp();
});

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app) {
        window.app.showAlert('An unexpected error occurred. Please try again.', 'danger');
    }
});