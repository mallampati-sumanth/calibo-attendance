// Reports Manager
class ReportsManager {
    constructor() {
        this.currentReportType = 'monthly';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDateDefaults();
        // Don't populate dropdowns here - wait until user is authenticated
        // populateDropdowns will be called when reports section is shown
    }

    bindEvents() {
        // Report type switching
        document.querySelectorAll('input[name="report-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchReportType(e.target.value);
            });
        });

        // Generate report buttons
        document.getElementById('generate-monthly-report')?.addEventListener('click', () => {
            this.generateMonthlyReport();
        });

        document.getElementById('generate-daily-report')?.addEventListener('click', () => {
            this.generateDailyReport();
        });

        document.getElementById('generate-student-report')?.addEventListener('click', () => {
            this.generateStudentReport();
        });

        // Export buttons
        document.getElementById('export-monthly-report')?.addEventListener('click', () => {
            this.exportMonthlyReport();
        });

        document.getElementById('export-daily-report')?.addEventListener('click', () => {
            this.exportDailyReport();
        });
    }

    setupDateDefaults() {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        this.currentYear = today.getFullYear(); // Store current year

        // Set default values
        const monthSelect = document.getElementById('report-month');
        const dailyDateInput = document.getElementById('daily-report-date');

        if (monthSelect) {
            // Populate months
            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = new Date(2000, i - 1).toLocaleString('default', { month: 'long' });
                if (i === currentMonth) option.selected = true;
                monthSelect.appendChild(option);
            }
        }

        if (dailyDateInput) {
            dailyDateInput.value = today.toISOString().split('T')[0];
        }
    }

    async populateDropdowns() {
        try {
            // Load students for student report dropdown
            const response = await window.app.api('/api/students');
            const students = await response.json();

            const studentSelect = document.getElementById('report-student');
            if (studentSelect) {
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.roll_number} - ${student.first_name} ${student.last_name}`;
                    studentSelect.appendChild(option);
                });
            }

            // Populate batch dropdowns
            const batches = ['KL University', 'Diet College'];
            const batchSelects = [
                document.getElementById('report-batch'),
                document.getElementById('daily-report-batch')
            ];

            batchSelects.forEach(select => {
                if (select) {
                    // Clear existing options except the first one (All Batches)
                    while (select.options.length > 1) {
                        select.remove(1);
                    }
                    
                    batches.forEach(batch => {
                        const option = document.createElement('option');
                        option.value = batch;
                        option.textContent = batch;
                        select.appendChild(option);
                    });
                }
            });

            // Populate course dropdowns
            const courses = ['Calibo Training'];
            const courseSelects = [
                document.getElementById('report-course'),
                document.getElementById('daily-report-course')
            ];

            courseSelects.forEach(select => {
                if (select) {
                    // Clear existing options except the first one (All Courses)
                    while (select.options.length > 1) {
                        select.remove(1);
                    }
                    
                    courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course;
                        option.textContent = course;
                        select.appendChild(option);
                    });
                }
            });
        } catch (error) {
            console.error('Failed to populate dropdowns:', error);
        }
    }

    switchReportType(type) {
        this.currentReportType = type;

        // Hide all report sections
        document.querySelectorAll('.report-section').forEach(section => {
            section.classList.add('d-none');
        });

        // Show selected report section
        const targetSection = document.getElementById(`${type}-report-section`);
        if (targetSection) {
            targetSection.classList.remove('d-none');
        }
    }

    async generateMonthlyReport() {
        try {
            console.log('📊 Generating monthly report...');
            window.app.showSpinner();

            const month = document.getElementById('report-month').value;
            const year = this.currentYear || new Date().getFullYear();
            const college = document.getElementById('report-college').value;
            const batch = document.getElementById('report-batch').value;
            const course = document.getElementById('report-course').value;

            console.log('Report params:', { month, year, college, batch, course });

            const params = new URLSearchParams();
            if (college) params.append('batch', college);
            else if (batch) params.append('batch', batch);
            if (course) params.append('course', course);

            const apiUrl = `/api/reports/monthly/${month}/${year}?${params}`;
            console.log('API URL:', apiUrl);

            const response = await window.app.api(apiUrl);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reportData = await response.json();
            console.log('Report data received:', reportData);

            this.renderMonthlyReport(reportData, college || batch);
            document.getElementById('export-monthly-report').disabled = false;
            window.app.showAlert('Monthly report generated successfully!', 'success', 3000);

        } catch (error) {
            console.error('❌ Failed to generate monthly report:', error);
            window.app.showAlert('Failed to generate monthly report: ' + error.message, 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }

    async generateDailyReport() {
        try {
            console.log('📅 Generating daily report...');
            window.app.showSpinner();

            const date = document.getElementById('daily-report-date').value;
            const college = document.getElementById('daily-report-college').value;
            const batch = document.getElementById('daily-report-batch').value;
            const course = document.getElementById('daily-report-course').value;

            if (!date) {
                window.app.showAlert('Please select a date', 'warning');
                window.app.hideSpinner();
                return;
            }

            console.log('Report params:', { date, college, batch, course });

            const params = new URLSearchParams();
            if (college) params.append('batch', college);
            else if (batch) params.append('batch', batch);
            if (course) params.append('course', course);

            const apiUrl = `/api/reports/daily/${date}?${params}`;
            console.log('API URL:', apiUrl);

            const response = await window.app.api(apiUrl);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reportData = await response.json();
            console.log('Report data received:', reportData);

            this.renderDailyReport(reportData, college || batch);
            document.getElementById('export-daily-report').disabled = false;
            window.app.showAlert('Daily report generated successfully!', 'success', 3000);

        } catch (error) {
            console.error('❌ Failed to generate daily report:', error);
            window.app.showAlert('Failed to generate daily report: ' + error.message, 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }

    async generateStudentReport() {
        try {
            console.log('👤 Generating student report...');
            window.app.showSpinner();

            const studentId = document.getElementById('report-student').value;
            const fromDate = document.getElementById('student-report-from').value;
            const toDate = document.getElementById('student-report-to').value;

            if (!studentId) {
                window.app.showAlert('Please select a student', 'warning');
                window.app.hideSpinner();
                return;
            }

            console.log('Report params:', { studentId, fromDate, toDate });

            const params = new URLSearchParams();
            if (fromDate) params.append('start_date', fromDate);
            if (toDate) params.append('end_date', toDate);

            const apiUrl = `/api/reports/student/${studentId}/history?${params}`;
            console.log('API URL:', apiUrl);

            const response = await window.app.api(apiUrl);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reportData = await response.json();
            console.log('Report data received:', reportData);

            this.renderStudentReport(reportData);
            window.app.showAlert('Student report generated successfully!', 'success', 3000);

        } catch (error) {
            console.error('❌ Failed to generate student report:', error);
            window.app.showAlert('Failed to generate student report: ' + error.message, 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }

    renderMonthlyReport(data, collegeFilter = '') {
        const container = document.getElementById('monthly-report-results');
        
        if (!data.students || data.students.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No data found for the selected criteria.</div>';
            return;
        }

        // Calculate college-wise statistics
        const totalPresent = data.students.reduce((sum, s) => sum + s.present_days, 0);
        const totalAbsent = data.students.reduce((sum, s) => sum + s.absent_days, 0);
        const collegeTitle = collegeFilter ? ` - ${collegeFilter}` : '';

        let html = `
            <div class="row mb-3">
                <div class="col-md-12">
                    <h5>Monthly Report${collegeTitle} - ${this.getMonthName(data.month)} ${data.year}</h5>
                    <p class="text-muted">
                        Working Days: ${data.working_days} | 
                        Total Students: ${data.summary.total_students} | 
                        Average Attendance: ${data.summary.avg_attendance}%
                    </p>
                    <div class="alert alert-info">
                        <strong>Summary:</strong> 
                        Total Present: <span class="badge bg-success">${totalPresent}</span> | 
                        Total Absent: <span class="badge bg-danger">${totalAbsent}</span>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            <th>Batch</th>
                            <th>Course</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Total</th>
                            <th>Attendance %</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.students.forEach(student => {
            const attendanceClass = this.getAttendanceClass(student.attendance_percentage);
            html += `
                <tr>
                    <td>${student.roll_number}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td><span class="badge bg-secondary">${student.batch || 'N/A'}</span></td>
                    <td><span class="badge bg-info">${student.course || 'N/A'}</span></td>
                    <td><span class="text-success">${student.present_days}</span></td>
                    <td><span class="text-danger">${student.absent_days}</span></td>
                    <td>${student.total_marked_days}</td>
                    <td><span class="badge bg-${attendanceClass}">${student.attendance_percentage}%</span></td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    renderDailyReport(data, collegeFilter = '') {
        const container = document.getElementById('daily-report-results');
        
        if (!data.students || data.students.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No data found for the selected date.</div>';
            return;
        }

        const collegeTitle = collegeFilter ? ` - ${collegeFilter}` : '';

        let html = `
            <div class="row mb-3">
                <div class="col-md-12">
                    <h5>Daily Report${collegeTitle} - ${window.app.formatDate(data.date)}</h5>
                    <div class="alert alert-success">
                        <strong>Attendance Summary:</strong><br>
                        Total Students: <span class="badge bg-primary">${data.summary.total}</span> | 
                        Present: <span class="badge bg-success">${data.summary.present}</span> | 
                        Absent: <span class="badge bg-danger">${data.summary.absent}</span> | 
                        Attendance Rate: <span class="badge bg-info">${data.summary.attendance_percentage}%</span>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            <th>Batch</th>
                            <th>Course</th>
                            <th>Status</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.students.forEach(student => {
            const statusBadge = this.getStatusBadge(student.status);
            html += `
                <tr>
                    <td>${student.roll_number}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td><span class="badge bg-secondary">${student.batch || 'N/A'}</span></td>
                    <td><span class="badge bg-info">${student.course || 'N/A'}</span></td>
                    <td>${statusBadge}</td>
                    <td>${student.remarks || ''}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    renderStudentReport(data) {
        const container = document.getElementById('student-report-results');
        
        if (!data.attendance || data.attendance.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No attendance records found for the selected student and period.</div>';
            return;
        }

        const student = data.student;
        const summary = data.summary;

        let html = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>${student.first_name} ${student.last_name}</h5>
                            <p class="text-muted mb-1">Roll Number: ${student.roll_number}</p>
                            <p class="text-muted mb-1">Batch: ${student.batch || 'N/A'}</p>
                            <p class="text-muted mb-0">Course: ${student.course || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Attendance Summary</h5>
                            <p class="mb-1">Total Days: ${summary.total_days}</p>
                            <p class="mb-1">Present: <span class="text-success">${summary.present_days}</span></p>
                            <p class="mb-1">Absent: <span class="text-danger">${summary.absent_days}</span></p>
                            <p class="mb-0">Percentage: <span class="badge bg-${this.getAttendanceClass(summary.attendance_percentage)}">${summary.attendance_percentage}%</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th>Marked At</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.attendance.forEach(record => {
            const statusBadge = this.getStatusBadge(record.status);
            html += `
                <tr>
                    <td>${window.app.formatDate(record.attendance_date)}</td>
                    <td>${statusBadge}</td>
                    <td>${record.remarks || ''}</td>
                    <td>${window.app.formatDateTime(record.marked_at)}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    getStatusBadge(status) {
        switch (status) {
            case 'present':
                return '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Present</span>';
            case 'absent':
                return '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Absent</span>';
            default:
                return '<span class="badge bg-secondary">Not Marked</span>';
        }
    }

    getAttendanceClass(percentage) {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    }

    getMonthName(month) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1] || 'Unknown';
    }

    async exportMonthlyReport() {
        try {
            const month = document.getElementById('report-month').value;
            const year = document.getElementById('report-year').value;
            const batch = document.getElementById('report-batch').value;
            const course = document.getElementById('report-course').value;

            const params = new URLSearchParams({ format: 'csv' });
            if (batch) params.append('batch', batch);
            if (course) params.append('course', course);

            const response = await window.app.api(`/api/reports/export/monthly/${month}/${year}?${params}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Create readable filename with college name and date
                const monthName = this.getMonthName(parseInt(month));
                const collegeName = batch ? batch.replace(/\s+/g, '_') : 'All_Colleges';
                const fileName = `${collegeName}_Attendance_${monthName}_${year}.csv`;
                
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
                
                window.app.showAlert('Report exported successfully!', 'success');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            window.app.showAlert('Failed to export report', 'danger');
        }
    }

    async exportDailyReport() {
        try {
            const date = document.getElementById('daily-report-date').value;
            const batch = document.getElementById('daily-report-batch').value;
            const course = document.getElementById('daily-report-course').value;

            const params = new URLSearchParams();
            if (batch) params.append('batch', batch);
            if (course) params.append('course', course);

            const response = await window.app.api(`/api/reports/export/daily/${date}?${params}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Create readable filename with college name and formatted date
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                }).replace(/ /g, '_');
                
                const collegeName = batch ? batch.replace(/\s+/g, '_') : 'All_Colleges';
                const fileName = `${collegeName}_Attendance_${formattedDate}.csv`;
                
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
                
                window.app.showAlert('Report exported successfully!', 'success');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            window.app.showAlert('Failed to export report', 'danger');
        }
    }
}

// Initialize reports manager
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});