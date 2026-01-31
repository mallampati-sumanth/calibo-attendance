// Attendance Manager
class AttendanceManager {
    constructor() {
        this.students = [];
        this.attendanceData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDateDefaults();
    }

    bindEvents() {
        // Load students button
        document.getElementById('load-attendance')?.addEventListener('click', () => {
            this.loadStudentsForAttendance();
        });

        // Save attendance button
        document.getElementById('save-attendance')?.addEventListener('click', () => {
            this.saveAttendance();
        });

        // Select all checkbox functionality
        document.getElementById('select-all-students')?.addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Search functionality
        document.getElementById('attendance-search')?.addEventListener('input', (e) => {
            this.filterAttendanceTable(e.target.value);
        });

        // Date change event
        document.getElementById('attendance-date')?.addEventListener('change', () => {
            this.updateSaveButtonState();
        });
    }

    setupDateDefaults() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('attendance-date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    filterByCollege(college) {
        // Update the college selector and reload students
        const batchElement = document.getElementById('attendance-batch');
        if (batchElement) {
            batchElement.value = college;
        }
        
        // Update filter button states
        document.querySelectorAll('#filter-klu, #filter-diet, #filter-all').forEach(btn => {
            btn.classList.remove('active');
        });

        const filterButtons = {
            'KL University': document.getElementById('filter-klu'),
            'Diet College': document.getElementById('filter-diet'),
            '': document.getElementById('filter-all')
        };

        const activeButton = filterButtons[college];
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Reload students with filter
        this.loadStudentsForAttendance();
    }

    async loadStudentsForAttendance() {
        try {
            console.log('📚 Loading students for attendance...');
            this.showLoadingState();
            window.app.showSpinner();

            const dateElement = document.getElementById('attendance-date');
            const batchElement = document.getElementById('attendance-batch');
            
            if (!dateElement) {
                console.error('❌ Date input not found');
                window.app.showAlert('Date input not found', 'danger');
                return;
            }

            const date = dateElement.value;
            const batch = batchElement ? batchElement.value : '';

            console.log('Selected date:', date);
            console.log('Selected batch:', batch);

            if (!date) {
                window.app.showAlert('Please select a date first', 'warning');
                return;
            }

            // Build query parameters
            const params = new URLSearchParams({ date });
            if (batch) params.append('batch', batch);

            // Correct endpoint path to match app.py
            const apiUrl = `/api/attendance/by-date?${params.toString()}`;
            console.log('API URL:', apiUrl);

            const response = await window.app.api(apiUrl);
            
            if (!response.ok) {
                const text = await response.text();
                console.error("API Error Response:", text);
                throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
            }
            
            const data = await response.json();
            const attendanceData = data.attendance || [];
            console.log('✅ Received attendance data:', attendanceData.length, 'records');

            // Check if all students already have attendance marked
            const allMarked = attendanceData.every(student => student.status && student.status !== 'not_marked');
            
            if (allMarked && attendanceData.length > 0) {
                window.app.showAlert(
                    `Attendance already marked for ${batch || 'all students'} on ${date}. Viewing existing records.`,
                    'info',
                    5000
                );
            }

            this.renderAttendanceTable(attendanceData, allMarked);
            this.updateSaveButtonState();

        } catch (error) {
            console.error('Failed to load attendance:', error);
            window.app.showAlert('Failed to load attendance data: ' + error.message, 'danger');
            
            // Show error state in table
            const tbody = document.getElementById('attendance-tbody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="d-flex flex-column align-items-center text-danger">
                            <i class="bi bi-exclamation-triangle" style="font-size: 3rem; opacity: 0.7;"></i>
                            <h6 class="mt-3 mb-2">Failed to Load Students</h6>
                            <p>${error.message}</p>
                            <button class="btn btn-outline-primary" onclick="window.attendanceManager.loadStudentsForAttendance()">
                                <i class="bi bi-arrow-clockwise"></i> Retry
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } finally {
            window.app.hideSpinner();
        }
    }

    renderAttendanceTable(attendanceData, readOnly = false) {
        const tbody = document.getElementById('attendance-tbody');
        const loadingSpinner = document.getElementById('loading-spinner');
        const saveBtn = document.getElementById('save-attendance');
        
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
        
        if (!attendanceData || attendanceData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="d-flex flex-column align-items-center text-muted">
                            <i class="bi bi-person-x" style="font-size: 3rem; opacity: 0.5;"></i>
                            <h6 class="mt-3 mb-2">No Students Found</h6>
                            <p>No students found for the selected criteria</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        attendanceData.forEach(student => {
            const studentId = student.student_id || student.id;
            const status = student.status || 'not_marked';
            const remarks = student.remarks || '';
            const isAbsent = status === 'absent';

            html += `
                <tr data-student-id="${studentId}" class="student-row">
                    <td><strong>${student.roll_number}</strong></td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>
                        <div class="form-check simple-checkbox">
                            <input class="form-check-input student-checkbox" type="checkbox" 
                                   id="absent_${studentId}" value="${studentId}"
                                   data-student-id="${studentId}"
                                   ${isAbsent ? 'checked' : ''}
                                   ${readOnly ? 'disabled' : ''}
                                   title="${readOnly ? 'Already marked' : 'Mark as Absent'}">
                        </div>
                    </td>
                    <td>
                        <span class="badge ${student.batch === 'KL University' ? 'bg-primary' : 'bg-info'}">
                            ${student.batch || 'N/A'}
                        </span>
                    </td>
                    <td>
                        <span class="badge bg-success">${student.course || 'Calibo Training'}</span>
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm" 
                               placeholder="${readOnly ? 'No remarks' : 'Optional remarks...'}" 
                               name="remarks_${studentId}"
                               value="${remarks}"
                               ${readOnly ? 'readonly' : ''}>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        this.updateAttendanceSummary();

        // Disable save button if read-only
        if (readOnly && saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="bi bi-check-circle"></i> Already Marked';
            saveBtn.classList.remove('btn-success');
            saveBtn.classList.add('btn-secondary');
        }

        // Bind change events to checkboxes - ensure multiple selection works
        if (!readOnly) {
            tbody.querySelectorAll('.student-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                // Allow default checkbox behavior for multiple selections
                // Don't prevent default or stop propagation
                this.updateSelectAllState();
                this.updateAttendanceSummary();
                this.updateSaveButtonState();
                this.addRowAnimation(checkbox.closest('tr'));
            });
        });
        }

        // Update button states
        this.updateSelectAllState();
        
        // Show success message
        window.app.showAlert(`Successfully loaded ${attendanceData.length} students`, 'success', 3000);
    }

    updateAttendanceSummary() {
        const tbody = document.getElementById('attendance-tbody');
        const rows = tbody.querySelectorAll('tr[data-student-id]');
        
        let total = rows.length;
        let present = 0;
        let absent = 0;

        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const absentCheckbox = row.querySelector(`input[id="absent_${studentId}"]`);
            
            if (absentCheckbox && absentCheckbox.checked) {
                absent++;
            } else {
                present++;
            }
        });

        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        const summaryElement = document.getElementById('attendance-summary');
        const studentCountElement = document.getElementById('student-count');
        const lastUpdatedElement = document.getElementById('last-updated');
        
        if (summaryElement) {
            summaryElement.innerHTML = total > 0 ? `
                <div class="d-flex align-items-center gap-3">
                    <span class="badge bg-info">Total: ${total}</span>
                    <span class="badge bg-success">Present: ${present}</span>
                    <span class="badge bg-danger">Absent: ${absent}</span>
                    <span class="badge bg-primary">Attendance: ${percentage}%</span>
                </div>
            ` : '';
        }
        
        if (studentCountElement) {
            studentCountElement.textContent = `${total} students loaded`;
        }
        
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleTimeString();
        }
    }

    markAllStatus(status) {
        const tbody = document.getElementById('attendance-tbody');
        const radios = tbody.querySelectorAll(`input[type="radio"][value="${status}"]`);
        
        radios.forEach(radio => {
            radio.checked = true;
        });

        this.updateAttendanceSummary();
        this.updateSaveButtonState();
    }

    clearAllStatus() {
        const tbody = document.getElementById('attendance-tbody');
        const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
        const remarksInputs = tbody.querySelectorAll('input[type="text"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        remarksInputs.forEach(input => {
            input.value = '';
        });

        document.getElementById('select-all-students').checked = false;
        this.updateAttendanceSummary();
        this.updateSaveButtonState();
    }

    updateSaveButtonState() {
        const saveBtn = document.getElementById('save-attendance');
        const date = document.getElementById('attendance-date').value;
        const tbody = document.getElementById('attendance-tbody');
        const hasStudents = tbody.querySelectorAll('tr[data-student-id]').length > 0;
        
        if (saveBtn) {
            saveBtn.disabled = !date || !hasStudents;
        }
    }

    async saveAttendance() {
        try {
            const date = document.getElementById('attendance-date').value;
            const tbody = document.getElementById('attendance-tbody');
            const rows = tbody.querySelectorAll('tr[data-student-id]');

            if (!date) {
                window.app.showAlert('Please select a date', 'warning');
                return;
            }

            if (rows.length === 0) {
                window.app.showAlert('No students loaded', 'warning');
                return;
            }

            // Collect attendance data based on checkboxes
            const attendanceRecords = [];
            console.log(`📋 Processing ${rows.length} rows...`);
            
            rows.forEach((row, index) => {
                const studentId = row.getAttribute('data-student-id');
                const studentIdFromDataset = row.dataset.studentId;
                
                if (index < 3) {
                    console.log(`Row ${index}:`, {
                        getAttribute: studentId,
                        dataset: studentIdFromDataset,
                        outerHTML: row.outerHTML.substring(0, 200)
                    });
                }
                
                const absentCheckbox = row.querySelector(`input[id="absent_${studentId}"]`);
                const remarksInput = row.querySelector(`input[name="remarks_${studentId}"]`);
                
                // If checkbox is checked = absent, otherwise = present
                const status = absentCheckbox && absentCheckbox.checked ? 'absent' : 'present';
                
                const parsedId = parseInt(studentId);
                
                attendanceRecords.push({
                    student_id: parsedId,
                    status: status,
                    remarks: remarksInput ? remarksInput.value.trim() : ''
                });
            });

            console.log(`💾 Saving ${attendanceRecords.length} attendance records for date ${date}`);
            console.log('First 3 records:', attendanceRecords.slice(0, 3));

            // Show saving state
            const saveBtn = document.getElementById('save-attendance');
            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

            // Save attendance
            const response = await window.app.api('/api/attendance/mark', {
                method: 'POST',
                body: JSON.stringify({
                    attendance_date: date,
                    attendance_records: attendanceRecords
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
                const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
                
                window.app.showAlert(
                    `Attendance saved! Present: ${presentCount}, Absent: ${absentCount}`, 
                    'success',
                    3000
                );
                
                // Refresh to show updated state
                await this.loadStudentsForAttendance();
            } else {
                throw new Error(result.error || 'Failed to save attendance');
            }

        } catch (error) {
            console.error('Save attendance error:', error);
            window.app.showAlert('Failed to save attendance: ' + error.message, 'danger');
        } finally {
            // Restore button state
            const saveBtn = document.getElementById('save-attendance');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="bi bi-save"></i> Save Attendance';
            }
        }
    }

    // New methods for selected students functionality
    getSelectedStudentIds() {
        const checkboxes = document.querySelectorAll('.student-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.student-checkbox');
        console.log(`Toggle all checkboxes to: ${checked}, found ${checkboxes.length} checkboxes`);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        
        this.updateAttendanceSummary();
        this.updateSaveButtonState();
    }

    updateSelectAllState() {
        const allCheckboxes = document.querySelectorAll('.student-checkbox');
        const checkedBoxes = document.querySelectorAll('.student-checkbox:checked');
        const selectAllCheckbox = document.getElementById('select-all-students');
        
        if (selectAllCheckbox && allCheckboxes.length > 0) {
            if (checkedBoxes.length === 0) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = false;
            } else if (checkedBoxes.length === allCheckboxes.length) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = true;
            } else {
                selectAllCheckbox.indeterminate = true;
                selectAllCheckbox.checked = false;
            }
        }
    }

    updateSelectedButtonsState() {
        const selectedCount = document.querySelectorAll('.student-checkbox:checked').length;
        const selectedButtons = document.querySelectorAll('#mark-selected-present, #mark-selected-absent, #clear-selected');
        
        selectedButtons.forEach(btn => {
            btn.disabled = selectedCount === 0;
            // Update button text to show count
            if (selectedCount > 0) {
                const originalText = btn.textContent.split(' (')[0];
                btn.textContent = `${originalText} (${selectedCount})`;
            } else {
                btn.textContent = btn.textContent.split(' (')[0];
            }
        });
    }

    markSelectedStatus(status) {
        const selectedIds = this.getSelectedStudentIds();
        
        if (selectedIds.length === 0) {
            window.app.showAlert('Please select students first', 'warning');
            return;
        }

        const tbody = document.getElementById('attendance-tbody');
        selectedIds.forEach(studentId => {
            const radio = tbody.querySelector(`input[name="attendance_${studentId}"][value="${status}"]`);
            if (radio) {
                radio.checked = true;
            }
        });

        this.updateAttendanceSummary();
        this.updateSaveButtonState();
    }

    clearSelectedStatus() {
        const selectedIds = this.getSelectedStudentIds();
        
        if (selectedIds.length === 0) {
            window.app.showAlert('Please select students first', 'warning');
            return;
        }

        const tbody = document.getElementById('attendance-tbody');
        selectedIds.forEach(studentId => {
            const radios = tbody.querySelectorAll(`input[name="attendance_${studentId}"]`);
            const remarksInput = tbody.querySelector(`input[name="remarks_${studentId}"]`);
            
            radios.forEach(radio => {
                radio.checked = false;
            });
            
            if (remarksInput) {
                remarksInput.value = '';
            }
        });

        this.updateAttendanceSummary();
        this.updateSaveButtonState();
    }

    // Mode switching functionality
    switchMode(mode) {
        const detailedActions = document.getElementById('detailed-actions');
        const simpleActions = document.getElementById('simple-actions');
        const detailedHeaders = document.querySelectorAll('.detailed-header');
        const simpleHeaders = document.querySelectorAll('.simple-header');
        const detailedLabels = document.querySelectorAll('.detailed-label');
        const simpleLabels = document.querySelectorAll('.simple-label');

        if (mode === 'simple') {
            // Switch to simple mode
            detailedActions.style.display = 'none';
            simpleActions.style.display = 'block';
            
            detailedHeaders.forEach(el => el.style.display = 'none');
            simpleHeaders.forEach(el => el.style.display = 'block');
            detailedLabels.forEach(el => el.style.display = 'none');
            simpleLabels.forEach(el => el.style.display = 'block');
            
            // Clear all current selections and status
            this.clearAll();
        } else {
            // Switch to detailed mode
            detailedActions.style.display = 'block';
            simpleActions.style.display = 'none';
            
            detailedHeaders.forEach(el => el.style.display = 'block');
            simpleHeaders.forEach(el => el.style.display = 'none');
            detailedLabels.forEach(el => el.style.display = 'block');
            simpleLabels.forEach(el => el.style.display = 'none');
            
            // Clear all current selections and status
            this.clearAll();
        }
    }

    toggleSelectAllAbsent(checked) {
        // In simple mode, this is the same as toggleSelectAll
        this.toggleSelectAll(checked);
    }

    markCheckedAsAbsent() {
        const checkedBoxes = document.querySelectorAll('.student-checkbox:checked');
        
        if (checkedBoxes.length === 0) {
            window.app.showAlert('No students selected for absent marking', 'warning');
            return;
        }

        this.updateAttendanceSummary();
        this.updateSaveButtonState();
        window.app.showAlert(`Marked ${checkedBoxes.length} students as absent`, 'success');
    }

    markUncheckedAsPresent() {
        const uncheckedBoxes = document.querySelectorAll('.student-checkbox:not(:checked)');
        
        if (uncheckedBoxes.length === 0) {
            window.app.showAlert('All students are marked as absent', 'info');
            return;
        }

        this.updateAttendanceSummary();
        this.updateSaveButtonState();
        window.app.showAlert(`Marked ${uncheckedBoxes.length} students as present`, 'success');
    }

    clearSimpleMode() {
        const allCheckboxes = document.querySelectorAll('.student-checkbox');
        const allRadios = document.querySelectorAll('input[type="radio"]');
        const remarksInputs = document.querySelectorAll('input[type="text"]');
        
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        allRadios.forEach(radio => {
            radio.checked = false;
        });

        remarksInputs.forEach(input => {
            input.value = '';
        });

        document.getElementById('select-all-students').checked = false;
        this.updateAttendanceSummary();
        this.updateSaveButtonState();
    }

    clearAll() {
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const allRadios = document.querySelectorAll('input[type="radio"]');
        const remarksInputs = document.querySelectorAll('input[type="text"]');
        
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        allRadios.forEach(radio => {
            radio.checked = false;
        });

        remarksInputs.forEach(input => {
            input.value = '';
        });

        this.updateAttendanceSummary();
        this.updateSaveButtonState();
    }

    // Utility method for row animations
    addRowAnimation(row) {
        if (row) {
            row.style.transform = 'scale(1.02)';
            row.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                row.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Search/Filter functionality
    filterAttendanceTable(searchTerm) {
        const tbody = document.getElementById('attendance-tbody');
        const rows = tbody.querySelectorAll('tr[data-student-id]');
        const term = searchTerm.toLowerCase().trim();
        
        let visibleCount = 0;
        
        rows.forEach(row => {
            if (!term) {
                row.style.display = '';
                visibleCount++;
                return;
            }
            
            const rollNumber = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
            const studentName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
            const college = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
            
            if (rollNumber.includes(term) || studentName.includes(term) || college.includes(term)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show message if no results
        if (visibleCount === 0 && term) {
            const existingMsg = tbody.querySelector('.no-search-results');
            if (!existingMsg) {
                const noResultsRow = document.createElement('tr');
                noResultsRow.className = 'no-search-results';
                noResultsRow.innerHTML = `
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
                        <p class="mt-2 mb-0">No students found matching "${searchTerm}"</p>
                    </td>
                `;
                tbody.appendChild(noResultsRow);
            }
        } else {
            // Remove no results message if it exists
            const existingMsg = tbody.querySelector('.no-search-results');
            if (existingMsg) {
                existingMsg.remove();
            }
        }
    }

    // Enhanced loading state
    showLoadingState() {
        const tbody = document.getElementById('attendance-tbody');
        const loadingSpinner = document.getElementById('loading-spinner');
        
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="d-flex flex-column align-items-center text-muted">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h6>Loading Students...</h6>
                        <p>Please wait while we fetch the student data</p>
                    </div>
                </td>
            </tr>
        `;
        
        if (loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
    }
}

// Initialize attendance manager
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceManager = new AttendanceManager();
});