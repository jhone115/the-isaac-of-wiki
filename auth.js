// auth.js - Sistema de autenticación actualizado con JSON
const ADMIN_USERS = ['admin', 'edmund', 'nico'];

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    checkLoggedInUser();
    
    // Event listeners para botones principales
    document.getElementById('btn-login').addEventListener('click', showLoginModal);
    document.getElementById('btn-register').addEventListener('click', showRegisterModal);
    document.getElementById('btn-logout').addEventListener('click', logout);
    
    // Event listeners para formularios
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Event listeners para enlaces de navegación entre modales
    document.getElementById('switch-to-register').addEventListener('click', switchToRegister);
    document.getElementById('switch-to-login').addEventListener('click', switchToLogin);
    
    // Event listener para fortaleza de contraseña
    document.getElementById('register-password').addEventListener('input', showPasswordStrength);
    
    // Inicializar mejoras de UI
    initializeModalEnhancements();
}

// ===== FUNCIONES DE NAVEGACIÓN ENTRE MODALES =====

function switchToRegister(e) {
    e.preventDefault();
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (loginModal) {
        loginModal.hide();
        // Usar setTimeout para asegurar que el modal se haya cerrado
        setTimeout(() => {
            showRegisterModal();
        }, 300);
    } else {
        showRegisterModal();
    }
}

function switchToLogin(e) {
    e.preventDefault();
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    if (registerModal) {
        registerModal.hide();
        setTimeout(() => {
            showLoginModal();
        }, 300);
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    // Limpiar formulario
    document.getElementById('login-form').reset();
    hideLoginFeedback();
    
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showRegisterModal() {
    // Limpiar formulario
    document.getElementById('register-form').reset();
    hideRegisterFeedback();
    hidePasswordStrength();
    
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
}

// ===== FUNCIONES DE AUTENTICACIÓN =====

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');
    
    // Validaciones básicas
    if (!username || !password) {
        showLoginFeedback('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Mostrar estado de carga
    setButtonLoading(submitBtn, true);
    
    try {
        // Simular delay para mejor UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Autenticar usuario
        const user = usersManager.authenticate(username, password);
        
        if (user) {
            // Login exitoso
            setCurrentUser(user);
            showUserInfo(user);
            
            // Cerrar modal
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            
            showAlert(`¡Bienvenido de nuevo, ${user.username}!`, 'success');
        } else {
            showLoginFeedback('Usuario o contraseña incorrectos', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showLoginFeedback('Error al iniciar sesión', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const isAdmin = document.getElementById('admin-check').checked;
    const acceptTerms = document.getElementById('accept-terms').checked;
    const submitBtn = document.getElementById('register-submit-btn');
    
    // Validaciones
    if (!username || !email || !password || !confirmPassword) {
        showRegisterFeedback('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!acceptTerms) {
        showRegisterFeedback('Debes aceptar los términos y condiciones', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showRegisterFeedback('Las contraseñas no coinciden', 'error', 'confirm-password-feedback');
        return;
    }
    
    if (username.length < 3) {
        showRegisterFeedback('El usuario debe tener al menos 3 caracteres', 'error', 'username-feedback');
        return;
    }
    
    if (!isValidEmail(email)) {
        showRegisterFeedback('Email no válido', 'error', 'email-feedback');
        return;
    }
    
    // Validar fortaleza de contraseña
    const strength = passwordEncryption.validatePasswordStrength(password);
    if (!strength.isStrong) {
        showRegisterFeedback('La contraseña es muy débil. Debe tener al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos.', 'error', 'password-feedback');
        return;
    }
    
    // Verificar si el usuario ya existe
    if (usersManager.userExists(username, email)) {
        showRegisterFeedback('El usuario o email ya están registrados', 'error');
        return;
    }
    
    // Verificar permisos de administrador
    const canBeAdmin = isAdmin && ADMIN_USERS.includes(username);
    if (isAdmin && !canBeAdmin) {
        showRegisterFeedback('No tienes permisos para ser administrador', 'warning');
        return;
    }
    
    // Mostrar estado de carga
    setButtonLoading(submitBtn, true);
    
    try {
        // Simular delay para mejor UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Crear nuevo usuario
        const newUser = usersManager.addUser({
            username,
            email,
            password,
            isAdmin: canBeAdmin
        });
        
        // Auto-login después del registro
        setCurrentUser(newUser);
        showUserInfo(newUser);
        
        // Cerrar modal
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        registerModal.hide();
        
        showAlert(`¡Cuenta creada exitosamente! Bienvenido, ${username}`, 'success');
        
    } catch (error) {
        console.error('Error en registro:', error);
        showRegisterFeedback('Error al crear la cuenta', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ===== FUNCIONES DE UTILIDAD =====

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        button.disabled = true;
    } else {
        btnText.style.display = 'flex';
        btnLoading.style.display = 'none';
        button.disabled = false;
    }
}

function showLoginFeedback(message, type = 'info', field = 'general') {
    const feedbackElement = document.getElementById('login-feedback') || createLoginFeedbackElement();
    feedbackElement.textContent = message;
    feedbackElement.className = `auth-feedback auth-feedback-${type}`;
    feedbackElement.style.display = 'block';
}

function hideLoginFeedback() {
    const feedbackElement = document.getElementById('login-feedback');
    if (feedbackElement) {
        feedbackElement.style.display = 'none';
    }
}

function showRegisterFeedback(message, type = 'info', fieldId = 'general-feedback') {
    const feedbackElement = document.getElementById(fieldId);
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = `auth-form-feedback ${type}`;
        feedbackElement.style.display = 'block';
    }
}

function hideRegisterFeedback() {
    const feedbackElements = document.querySelectorAll('#register-form .auth-form-feedback');
    feedbackElements.forEach(element => {
        element.style.display = 'none';
    });
}

function createLoginFeedbackElement() {
    const feedbackElement = document.createElement('div');
    feedbackElement.id = 'login-feedback';
    feedbackElement.className = 'auth-feedback';
    document.getElementById('login-form').appendChild(feedbackElement);
    return feedbackElement;
}

// ===== FUNCIONES DE GESTIÓN DE SESIÓN =====

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

function logout() {
    removeCurrentUser();
    showAuthButtons();
    showAlert('Sesión cerrada correctamente', 'info');
}

function checkLoggedInUser() {
    const user = getCurrentUser();
    if (user) {
        showUserInfo(user);
    } else {
        showAuthButtons();
    }
}

function showUserInfo(user) {
    document.getElementById('btn-login').style.display = 'none';
    document.getElementById('btn-register').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('username-display').textContent = user.username + (user.isAdmin ? ' (Admin)' : '');
}

function showAuthButtons() {
    document.getElementById('btn-login').style.display = 'block';
    document.getElementById('btn-register').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
}

// ===== FUNCIONES DE UI MEJORADAS =====

function initializeModalEnhancements() {
    initializePasswordToggles();
    initializeRealTimeValidation();
    initializeFocusEffects();
}

function initializePasswordToggles() {
    const toggles = document.querySelectorAll('.password-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            const icon = this.querySelector('svg');
            if (type === 'text') {
                icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            } else {
                icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            }
        });
    });
}

function initializeRealTimeValidation() {
    const usernameInput = document.getElementById('register-username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            const feedback = document.getElementById('username-feedback');
            const value = this.value.trim();
            
            if (value.length < 3) {
                setFieldValidation(this, false, 'Mínimo 3 caracteres');
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                setFieldValidation(this, false, 'Solo letras, números y _');
            } else if (usersManager.userExists(value)) {
                setFieldValidation(this, false, 'Usuario ya existe');
            } else {
                setFieldValidation(this, true, '✓ Usuario disponible');
            }
        });
    }
    
    const emailInput = document.getElementById('register-email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && !isValidEmail(value)) {
                setFieldValidation(this, false, 'Email no válido');
            } else if (value && usersManager.userExists(null, value)) {
                setFieldValidation(this, false, 'Email ya registrado');
            } else if (value && isValidEmail(value)) {
                setFieldValidation(this, true, '✓ Email válido');
            } else {
                clearFieldValidation(this);
            }
        });
    }
    
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('register-password').value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                setFieldValidation(this, false, 'Las contraseñas no coinciden');
            } else if (confirmPassword && password === confirmPassword) {
                setFieldValidation(this, true, '✓ Contraseñas coinciden');
            } else {
                clearFieldValidation(this);
            }
        });
    }
}

function setFieldValidation(field, isValid, message) {
    const feedback = field.parentElement.querySelector('.auth-form-feedback') || createFeedbackElement(field);
    
    field.classList.remove('valid', 'invalid');
    field.classList.add(isValid ? 'valid' : 'invalid');
    
    feedback.textContent = message;
    feedback.className = `auth-form-feedback ${isValid ? 'valid' : 'invalid'}`;
    feedback.style.display = 'block';
}

function clearFieldValidation(field) {
    field.classList.remove('valid', 'invalid');
    const feedback = field.parentElement.querySelector('.auth-form-feedback');
    if (feedback) {
        feedback.style.display = 'none';
    }
}

function createFeedbackElement(field) {
    const feedback = document.createElement('div');
    feedback.className = 'auth-form-feedback';
    field.parentElement.appendChild(feedback);
    return feedback;
}

function showPasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strength = passwordEncryption.validatePasswordStrength(password);
    updatePasswordStrength(strength);
}

function updatePasswordStrength(strength) {
    const container = document.getElementById('password-strength-container');
    const fill = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');
    
    if (!container || !fill || !text) return;
    
    const colors = ['#dc3545', '#dc3545', '#fd7e14', '#ffc107', '#20c997', '#198754'];
    const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
    
    const width = (strength.score / 5) * 100;
    
    fill.style.width = width + '%';
    fill.style.backgroundColor = colors[strength.score];
    text.textContent = `Fortaleza: ${labels[strength.score]}`;
    text.style.color = colors[strength.score];
    
    container.style.display = password ? 'block' : 'none';
}

function hidePasswordStrength() {
    const container = document.getElementById('password-strength-container');
    if (container) {
        container.style.display = 'none';
    }
}

function initializeFocusEffects() {
    const inputs = document.querySelectorAll('.auth-form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Exportar para uso global
window.auth = {
    isAdmin: () => {
        const user = getCurrentUser();
        return user && user.isAdmin;
    },
    getUser: getCurrentUser,
    debugUsers: () => {
        if (auth.isAdmin()) {
            console.log('Usuarios registrados:', usersManager.getAllUsers());
            showAlert('Información de usuarios mostrada en consola', 'info');
        } else {
            showAlert('No tienes permisos de administrador', 'error');
        }
    },
    exportUsers: () => {
        if (auth.isAdmin()) {
            return usersManager.exportUsers();
        }
        return null;
    }
};