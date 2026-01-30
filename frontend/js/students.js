// Students Manager
class StudentsManager {
    constructor() {
        this.students = [];
        this.filteredStudents = [];
        this.init();
    }

    init() {
        this.bindEvents();
        // Don't load students here - wait until students section is shown
    }

    bindEvents() {
        // Add student button
        document.querySelector('[data-bs-target="#addStudentModal"]')?.addEventListener('click', () => {
            this.openAddStudentModal();
        });

        // Save student button
        document.getElementById('save-student')?.addEventListener('click', () => {
            this.saveStudent();
        });

        // Event delegation for student action buttons
        document.getElementById('students-tbody')?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit-student');
            const viewBtn = e.target.closest('.btn-view-attendance');
            const deleteBtn = e.target.closest('.btn-delete-student');

            if (editBtn) {
                const studentId = parseInt(editBtn.dataset.studentId);
                this.editStudent(studentId);
            } else if (viewBtn) {
                const studentId = parseInt(viewBtn.dataset.studentId);
                this.viewAttendance(studentId);
            } else if (deleteBtn) {
                const studentId = parseInt(deleteBtn.dataset.studentId);
                this.deleteStudent(studentId);
            }
        });

        // Search and filter events
        document.getElementById('search-students')?.addEventListener('input', 
            window.app.debounce((e) => this.filterStudents(), 300)
        );

        document.getElementById('filter-batch')?.addEventListener('change', () => {
            this.filterStudents();
        });

        document.getElementById('filter-course')?.addEventListener('change', () => {
            this.filterStudents();
        });

        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Student form validation
        document.getElementById('student-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudent();
        });
    }

    async loadStudents() {
        try {
            window.app.showSpinner();

            const response = await window.app.api('/api/students');
            const data = await response.json();
            // Handle wrapped response
            this.students = Array.isArray(data) ? data : (data.students || []);
            
            this.filteredStudents = [...this.students];
            
            this.renderStudentsTable();
        } catch (error) {
            console.error('Failed to load students:', error);
            window.app.showAlert('Failed to load students', 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }

    renderStudentsTable() {
        const tbody = document.getElementById('students-tbody');
        
        if (!this.filteredStudents || this.filteredStudents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="bi bi-people fs-1 d-block mb-2"></i>
                        No students found
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        this.filteredStudents.forEach(student => {
            const statusBadge = student.status === 'active' ? 
                '<span class="badge bg-success">Active</span>' : 
                '<span class="badge bg-secondary">Inactive</span>';

            html += `
                <tr>
                    <td>${student.roll_number}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.email || 'N/A'}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td><span class="badge bg-info">${student.course || 'N/A'}</span></td>
                    <td><span class="badge bg-secondary">${student.batch || 'N/A'}</span></td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-edit-student" data-student-id="${student.id}" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-info btn-view-attendance" data-student-id="${student.id}" title="View Attendance">
                                <i class="bi bi-calendar-check"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-delete-student" data-student-id="${student.id}" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    filterStudents() {
        const search = document.getElementById('search-students').value.toLowerCase();
        const batchFilter = document.getElementById('filter-batch').value;
        const courseFilter = document.getElementById('filter-course').value;

        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = !search || 
                student.first_name.toLowerCase().includes(search) ||
                student.last_name.toLowerCase().includes(search) ||
                student.roll_number.toLowerCase().includes(search) ||
                (student.email && student.email.toLowerCase().includes(search));

            const matchesBatch = !batchFilter || student.batch === batchFilter;
            const matchesCourse = !courseFilter || student.course === courseFilter;

            return matchesSearch && matchesBatch && matchesCourse;
        });

        this.renderStudentsTable();
    }

    clearFilters() {
        document.getElementById('search-students').value = '';
        document.getElementById('filter-batch').value = '';
        document.getElementById('filter-course').value = '';
        this.filteredStudents = [...this.students];
        this.renderStudentsTable();
    }

    openAddStudentModal() {
        // Reset form
        document.getElementById('student-form').reset();
        document.getElementById('student-id').value = '';
        document.getElementById('modal-title').textContent = 'Add Student';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
        modal.show();
    }

    async editStudent(studentId) {
        try {
            const student = this.students.find(s => s.id === studentId);
            if (!student) {
                window.app.showAlert('Student not found', 'danger');
                return;
            }

            // Populate form
            document.getElementById('student-id').value = student.id;
            document.getElementById('student-roll').value = student.roll_number;
            document.getElementById('student-fname').value = student.first_name;
            document.getElementById('student-lname').value = student.last_name;
            document.getElementById('student-email').value = student.email || '';
            document.getElementById('student-phone').value = student.phone || '';
            document.getElementById('student-course').value = student.course || '';
            document.getElementById('student-batch').value = student.batch || '';
            document.getElementById('student-status').value = student.status;

            document.getElementById('modal-title').textContent = 'Edit Student';

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
            modal.show();

        } catch (error) {
            console.error('Failed to edit student:', error);
            window.app.showAlert('Failed to load student data', 'danger');
        }
    }

    async saveStudent() {
        try {
            const studentId = document.getElementById('student-id').value;
            const formData = {
                roll_number: document.getElementById('student-roll').value.trim(),
                first_name: document.getElementById('student-fname').value.trim(),
                last_name: document.getElementById('student-lname').value.trim(),
                email: document.getElementById('student-email').value.trim() || null,
                phone: document.getElementById('student-phone').value.trim() || null,
                course: document.getElementById('student-course').value.trim() || null,
                batch: document.getElementById('student-batch').value.trim() || null,
                status: document.getElementById('student-status').value
            };

            // Validation
            if (!formData.roll_number || !formData.first_name || !formData.last_name) {
                this.showStudentError('Roll number, first name, and last name are required');
                return;
            }

            // Show saving state
            const saveBtn = document.getElementById('save-student');
            const saveSpinner = document.getElementById('save-spinner');
            
            if (saveBtn) {
                saveBtn.disabled = true;
                if (saveSpinner) {
                    saveSpinner.classList.remove('d-none');
                }
                saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
            }

            // API call
            const url = studentId ? `/api/students/${studentId}` : '/api/students';
            const method = studentId ? 'PUT' : 'POST';

            const response = await window.app.api(url, {
                method: method,
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                window.app.showAlert(
                    `Student ${studentId ? 'updated' : 'added'} successfully!`, 
                    'success'
                );

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
                modal.hide();

                // Reload students
                await this.loadStudents();
                
                // Reload global app data
                await window.app.loadBatchesAndCourses();

            } else {
                throw new Error(result.error || 'Failed to save student');
            }

        } catch (error) {
            console.error('Save student error:', error);
            this.showStudentError(error.message);
        } finally {
            // Restore button state
            const saveBtn = document.getElementById('save-student');
            const saveSpinner = document.getElementById('save-spinner');
            
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Save Student';
            }
            if (saveSpinner) {
                saveSpinner.classList.add('d-none');
            }
        }
    }

    async deleteStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) {
            window.app.showAlert('Student not found', 'danger');
            return;
        }

        const confirmMessage = `Are you sure you want to delete ${student.first_name} ${student.last_name}? This action cannot be undone.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            window.app.showSpinner();

            const response = await window.app.api(`/api/students/${studentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                window.app.showAlert('Student deleted successfully', 'success');
                await this.loadStudents();
                await window.app.loadBatchesAndCourses();
            } else {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete student');
            }

        } catch (error) {
            console.error('Delete student error:', error);
            window.app.showAlert('Failed to delete student: ' + error.message, 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }

    async viewAttendance(studentId) {
        // Switch to reports section and load student report
        window.app.showSection('reports');
        
        // Switch to student report type
        document.getElementById('student-report').checked = true;
        window.reportsManager.switchReportType('student');
        
        // Set the student
        document.getElementById('report-student').value = studentId;
        
        // Set date range to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        document.getElementById('student-report-from').value = firstDay.toISOString().split('T')[0];
        document.getElementById('student-report-to').value = lastDay.toISOString().split('T')[0];
        
        // Generate the report
        setTimeout(() => {
            window.reportsManager.generateStudentReport();
        }, 500);
    }

    showStudentError(message) {
        const errorElement = document.getElementById('student-error');
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }

    hideStudentError() {
        const errorElement = document.getElementById('student-error');
        errorElement.classList.add('d-none');
    }
}

// Initialize students manager
document.addEventListener('DOMContentLoaded', () => {
    window.studentsManager = new StudentsManager();
});