// Dashboard Manager
class DashboardManager {
    constructor() {
        this.chartInstance = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDateDefaults();
    }

    bindEvents() {
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.loadDashboardData();
        });
    }

    setupDateDefaults() {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        // Will be used for dashboard date filtering if needed
    }

    async loadDashboardData() {
        try {
            window.app.showSpinner();
            
            // Load multiple data sources in parallel
            const [studentStats, todayAttendance, trends] = await Promise.all([
                this.loadStudentStats(),
                this.loadTodayAttendance(),
                this.loadAttendanceTrends()
            ]);

            this.updateStatsCards(studentStats, todayAttendance);
            this.updateAttendanceChart(trends);
            this.updateBatchStats(studentStats);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            window.app.showAlert('Failed to load dashboard data', 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }

    async loadStudentStats() {
        const response = await window.app.api('/api/students/stats/overview');
        return await response.json();
    }

    async loadTodayAttendance() {
        const today = new Date().toISOString().split('T')[0];
        const response = await window.app.api(`/api/attendance/stats/overview?date=${today}`);
        return await response.json();
    }

    async loadAttendanceTrends() {
        const response = await window.app.api('/api/reports/trends?days=7');
        return await response.json();
    }

    updateStatsCards(studentStats, todayAttendance) {
        // Total Students
        document.getElementById('total-students').textContent = studentStats.total || 0;

        // Today's Attendance
        const attendancePercentage = todayAttendance.percentage || 0;
        document.getElementById('today-attendance').textContent = `${attendancePercentage}%`;
        
        // Present Today
        document.getElementById('present-today').textContent = todayAttendance.present || 0;
        
        // Absent Today
        document.getElementById('absent-today').textContent = todayAttendance.absent || 0;

        // Update card colors based on attendance
        this.updateAttendanceCardColor(attendancePercentage);
    }

    updateAttendanceCardColor(percentage) {
        const attendanceCard = document.getElementById('today-attendance').closest('.card');
        
        // Remove existing color classes
        attendanceCard.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        
        // Add appropriate color class
        if (percentage >= 80) {
            attendanceCard.classList.add('bg-success');
        } else if (percentage >= 60) {
            attendanceCard.classList.add('bg-warning');
        } else {
            attendanceCard.classList.add('bg-danger');
        }
    }

    updateAttendanceChart(trends) {
        const canvas = document.getElementById('attendanceChart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Prepare data
        const labels = trends.map(item => {
            const date = new Date(item.attendance_date);
            return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        }).reverse();

        const attendanceData = trends.map(item => item.attendance_percentage).reverse();
        const presentData = trends.map(item => item.present).reverse();
        const totalData = trends.map(item => item.total).reverse();

        // Create simple chart using canvas
        this.drawAttendanceChart(ctx, labels, attendanceData, presentData, totalData);
    }

    drawAttendanceChart(ctx, labels, percentageData, presentData, totalData) {
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (!percentageData.length) {
            ctx.fillStyle = '#6c757d';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }

        const maxValue = Math.max(...percentageData, 100);
        const minValue = Math.min(...percentageData, 0);
        const valueRange = maxValue - minValue;

        // Draw grid lines
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Y-axis labels
            const value = maxValue - (valueRange / 5) * i;
            ctx.fillStyle = '#6c757d';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value) + '%', padding - 10, y + 4);
        }

        // Draw attendance line
        if (percentageData.length > 1) {
            ctx.strokeStyle = '#0d6efd';
            ctx.lineWidth = 3;
            ctx.beginPath();

            percentageData.forEach((value, index) => {
                const x = padding + (chartWidth / (percentageData.length - 1)) * index;
                const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw data points
            ctx.fillStyle = '#0d6efd';
            percentageData.forEach((value, index) => {
                const x = padding + (chartWidth / (percentageData.length - 1)) * index;
                const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // X-axis labels
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = padding + (chartWidth / (labels.length - 1)) * index;
            ctx.fillText(label, x, height - 10);
        });

        // Chart title
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Daily Attendance Percentage', width / 2, 20);
    }

    updateBatchStats(studentStats) {
        const container = document.getElementById('batch-stats');
        
        if (!studentStats.byBatch || !studentStats.byBatch.length) {
            container.innerHTML = '<p class="text-muted">No batch data available</p>';
            return;
        }

        // Sort to ensure KL University appears first
        const sortedBatches = [...studentStats.byBatch].sort((a, b) => {
            if (a.batch === 'KL University') return -1;
            if (b.batch === 'KL University') return 1;
            return a.batch.localeCompare(b.batch);
        });

        let html = '';
        sortedBatches.forEach(batch => {
            const percentage = studentStats.total > 0 ? 
                Math.round((batch.count / studentStats.total) * 100) : 0;

            html += `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <strong>${batch.batch || 'Unknown'}</strong>
                        <br>
                        <small class="text-muted">${batch.count} students</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary">${percentage}%</span>
                    </div>
                </div>
                <div class="progress mb-3" style="height: 8px;">
                    <div class="progress-bar bg-primary" style="width: ${percentage}%"></div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
}

// Initialize dashboard manager
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
});