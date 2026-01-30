// Profile Settings Manager
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadCurrentUsername();
        this.bindEvents();
    }

    bindEvents() {
        // Change Username Form
        document.getElementById('change-username-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.changeUsername();
        });

        // Change Password Form
        document.getElementById('change-password-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });
    }

    loadCurrentUsername() {
        const usernameDisplay = document.getElementById('username-display')?.textContent;
        const currentUsernameInput = document.getElementById('current-username');
        if (currentUsernameInput && usernameDisplay) {
            currentUsernameInput.value = usernameDisplay;
        }
    }

    async changeUsername() {
        try {
            const newUsername = document.getElementById('new-username').value.trim();
            const password = document.getElementById('confirm-password-username').value;

            if (!newUsername || newUsername.length < 3) {
                window.app.showAlert('Username must be at least 3 characters', 'warning');
                return;
            }

            window.app.showSpinner();

            const response = await window.app.api('/api/admin/change-username', {
                method: 'POST',
                body: JSON.stringify({
                    new_username: newUsername,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                window.app.showAlert('✅ Username updated successfully! Please login again.', 'success');
                
                // Update display
                document.getElementById('username-display').textContent = newUsername;
                document.getElementById('mobile-username-display').textContent = newUsername;
                document.getElementById('current-username').value = newUsername;
                
                // Clear form
                document.getElementById('change-username-form').reset();
                document.getElementById('current-username').value = newUsername;
            } else {
                throw new Error(result.error || 'Failed to update username');
            }

        } catch (error) {
            console.error('Change username error:', error);
            window.app.showAlert('Failed to update username: ' + error.message, 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }

    async changePassword() {
        try {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-new-password').value;

            if (newPassword.length < 6) {
                window.app.showAlert('New password must be at least 6 characters', 'warning');
                return;
            }

            if (newPassword !== confirmPassword) {
                window.app.showAlert('New passwords do not match', 'warning');
                return;
            }

            if (currentPassword === newPassword) {
                window.app.showAlert('New password must be different from current password', 'warning');
                return;
            }

            window.app.showSpinner();

            const response = await window.app.api('/api/admin/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                window.app.showAlert('✅ Password updated successfully!', 'success');
                
                // Clear form
                document.getElementById('change-password-form').reset();
            } else {
                throw new Error(result.error || 'Failed to update password');
            }

        } catch (error) {
            console.error('Change password error:', error);
            window.app.showAlert('Failed to update password: ' + error.message, 'danger');
        } finally {
            window.app.hideSpinner();
        }
    }
}

// Initialize profile manager
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});
