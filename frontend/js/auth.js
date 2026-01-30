// Authentication Manager
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindLoginForm();
        this.bindPasswordToggle();
    }

    bindPasswordToggle() {
        const toggleBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        const passwordIcon = document.getElementById('password-icon');

        if (toggleBtn && passwordInput && passwordIcon) {
            toggleBtn.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                passwordIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
            });
        }
    }

    bindLoginForm() {
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const loginSpinner = document.getElementById('login-spinner');
        const loginError = document.getElementById('login-error');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                this.showLoginError('Username and password are required');
                return;
            }

            this.setLoginLoading(true);

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Successful login
                    window.app.isAuthenticated = true;
                    window.app.currentUser = data.admin;
                    window.app.updateUserDisplay();
                    window.app.initApp();
                    this.hideLoginError();
                    
                    // Update mobile username display
                    const mobileUsernameDisplay = document.getElementById('mobile-username-display');
                    if (mobileUsernameDisplay && data.admin) {
                        mobileUsernameDisplay.textContent = data.admin.username;
                    }
                } else {
                    // Login failed
                    this.showLoginError(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showLoginError('Network error. Please try again.');
            } finally {
                this.setLoginLoading(false);
            }
        });
    }

    setLoginLoading(loading) {
        const loginBtn = document.getElementById('login-btn');
        const loginSpinner = document.getElementById('login-spinner');

        if (!loginBtn) return; // Guard against null element

        if (loading) {
            loginBtn.disabled = true;
            if (loginSpinner) loginSpinner.classList.remove('d-none');
            loginBtn.textContent = ' Logging in...';
        } else {
            loginBtn.disabled = false;
            if (loginSpinner) loginSpinner.classList.add('d-none');
            loginBtn.textContent = 'Login';
        }
    }

    showLoginError(message) {
        const loginError = document.getElementById('login-error');
        if (!loginError) return; // Guard against null element
        loginError.textContent = message;
        loginError.classList.remove('d-none');
    }

    hideLoginError() {
        const loginError = document.getElementById('login-error');
        if (!loginError) return; // Guard against null element
        loginError.classList.add('d-none');
    }
}

// Initialize auth manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager = new AuthManager();
    });
} else {
    // DOM already loaded
    window.authManager = new AuthManager();
}