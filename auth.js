// auth.js - Sistema de autenticación (sin encriptación)

// Lista de administradores (puedes agregar más usuarios aquí)
const ADMIN_USERS = ['admin', 'edmund', 'nico'];

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});
// Funciones adicionales para mejorar la UX
function initializeModalEnhancements() {
    // Toggle de visibilidad de contraseña
    initializePasswordToggles();
    
    // Switch entre modales
    initializeModalSwitchers();
    
    // Validación en tiempo real
    initializeRealTimeValidation();
    
    // Efectos de focus
    initializeFocusEffects();
}

function initializePasswordToggles() {
    const toggles = document.querySelectorAll('.password-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Cambiar ícono
            const icon = this.querySelector('svg');
            if (type === 'text') {
                icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            } else {
                icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            }
        });
    });
}

function initializeModalSwitchers() {
    // Login -> Register
    document.getElementById('switch-to-register').addEventListener('click', function(e) {
        e.preventDefault();
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        setTimeout(() => {
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
        }, 300);
    });
    
    // Register -> Login
    document.getElementById('switch-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        registerModal.hide();
        setTimeout(() => {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }, 300);
    });
}

function initializeRealTimeValidation() {
    // Validación de username en tiempo real
    const usernameInput = document.getElementById('register-username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            const feedback = document.getElementById('username-feedback');
            const value = this.value.trim();
            
            if (value.length < 3) {
                this.classList.add('invalid');
                this.classList.remove('valid');
                feedback.textContent = 'Mínimo 3 caracteres';
                feedback.className = 'auth-form-feedback invalid';
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                this.classList.add('invalid');
                this.classList.remove('valid');
                feedback.textContent = 'Solo letras, números y _';
                feedback.className = 'auth-form-feedback invalid';
            } else if (getUserByUsername(value)) {
                this.classList.add('invalid');
                this.classList.remove('valid');
                feedback.textContent = 'Usuario ya existe';
                feedback.className = 'auth-form-feedback invalid';
            } else {
                this.classList.add('valid');
                this.classList.remove('invalid');
                feedback.textContent = '✓ Usuario disponible';
                feedback.className = 'auth-form-feedback valid';
            }
        });
    }
    
    // Validación de fortaleza de contraseña
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = passwordEncryption.validatePasswordStrength(this.value);
            updatePasswordStrength(strength);
        });
    }
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
    
    container.style.display = 'block';
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

// Llamar esta función en initializeAuth()
function initializeAuth() {
    // Verificar si hay un usuario logueado al cargar la página
    checkLoggedInUser();
    
    // Event listeners para los botones
    document.getElementById('btn-login').addEventListener('click', showLoginModal);
    document.getElementById('btn-register').addEventListener('click', showRegisterModal);
    document.getElementById('btn-logout').addEventListener('click', logout);
    
    // Event listeners para los formularios
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Event listener para mostrar fortaleza de contraseña
    document.getElementById('register-password').addEventListener('input', showPasswordStrength);
    
    // Inicializar usuarios por defecto si no existen
    initializeDefaultUsers();
}

// ===== FUNCIONES DE GESTIÓN DE USUARIOS =====

function initializeDefaultUsers() {
    const users = getUsers();
    
    // Crear usuario admin por defecto si no existe
    if (!users.find(u => u.username === 'admin')) {
        const defaultAdmin = {
            username: 'admin',
            email: 'admin@isaacwiki.com',
            password: passwordEncryption.encrypt('admin123'), // Contraseña encriptada
            isAdmin: true,
            registrationDate: new Date().toISOString()
        };
        saveUser(defaultAdmin);
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem('isaac_wiki_users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('isaac_wiki_users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

function getUserByUsername(username) {
    const users = getUsers();
    return users.find(user => user.username === username);
}

function saveUser(user) {
    const users = getUsers();
    const existingUserIndex = users.findIndex(u => u.username === user.username);
    
    if (existingUserIndex !== -1) {
        users[existingUserIndex] = user;
    } else {
        users.push(user);
    }
    
    saveUsers(users);
    return user;
}

// ===== FUNCIONES DE INTERFAZ =====

function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showRegisterModal() {
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = getUserByUsername(username);
    
    if (!user) {
        showAlert('Usuario no encontrado', 'error');
        return;
    }
    
    // Verificar contraseña usando el sistema de encriptación
    const isValidPassword = passwordEncryption.verify(password, user.password);
    
    if (!isValidPassword) {
        showAlert('Contraseña incorrecta', 'error');
        return;
    }
    
    // Login exitoso
    setCurrentUser(user);
    showUserInfo(user);
    
    // Cerrar modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    
    // Limpiar formulario
    document.getElementById('login-form').reset();
    
    showAlert(`¡Bienvenido, ${user.username}!`, 'success');
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const isAdmin = document.getElementById('admin-check').checked;
    
    // Validaciones básicas
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (getUserByUsername(username)) {
        showAlert('El usuario ya existe', 'error');
        return;
    }
    
    if (username.length < 3) {
        showAlert('El usuario debe tener al menos 3 caracteres', 'error');
        return;
    }
    
    // Validar fortaleza de contraseña
    const strength = passwordEncryption.validatePasswordStrength(password);
    if (!strength.isStrong) {
        showAlert('La contraseña es muy débil. Debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos.', 'warning');
        return;
    }
    
    // Verificar si puede ser admin
    const canBeAdmin = isAdmin && ADMIN_USERS.includes(username);
    
    // Encriptar contraseña antes de guardar
    const encryptedPassword = passwordEncryption.encrypt(password);
    
    // Crear nuevo usuario
    const newUser = {
        username,
        email,
        password: encryptedPassword,
        isAdmin: canBeAdmin,
        registrationDate: new Date().toISOString()
    };
    
    // Guardar usuario
    saveUser(newUser);
    
    // Auto-login después del registro
    setCurrentUser(newUser);
    showUserInfo(newUser);
    
    // Cerrar modal
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
    
    // Limpiar formulario
    document.getElementById('register-form').reset();
    hidePasswordStrength();
    
    showAlert(`¡Cuenta creada exitosamente! Bienvenido, ${username}`, 'success');
}

function showPasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strength = passwordEncryption.validatePasswordStrength(password);
    
    let strengthElement = document.getElementById('password-strength');
    if (!strengthElement) {
        strengthElement = document.createElement('div');
        strengthElement.id = 'password-strength';
        strengthElement.className = 'password-strength';
        document.getElementById('register-password').parentNode.appendChild(strengthElement);
    }
    
    const strengthText = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'][strength.score];
    const strengthColors = ['#dc3545', '#dc3545', '#fd7e14', '#ffc107', '#20c997', '#198754'];
    
    strengthElement.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength.score / 5) * 100}%; background-color: ${strengthColors[strength.score]}"></div>
        </div>
        <small style="color: ${strengthColors[strength.score]}">Fortaleza: ${strengthText}</small>
    `;
}

function hidePasswordStrength() {
    const strengthElement = document.getElementById('password-strength');
    if (strengthElement) {
        strengthElement.remove();
    }
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

function showAlert(message, type = 'info') {
    // Crear elemento de alerta
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
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// ===== FUNCIONES ÚTILES PARA ADMINISTRADORES =====

function isCurrentUserAdmin() {
    const user = getCurrentUser();
    return user && user.isAdmin;
}

function getCurrentUserInfo() {
    return getCurrentUser();
}

function getAllUsers() {
    return getUsers();
}

// Función para que los administradores puedan ver todos los usuarios
function debugUsers() {
    if (isCurrentUserAdmin()) {
        console.log('Usuarios registrados:', getUsers());
        showAlert('Información de usuarios mostrada en consola', 'info');
    } else {
        showAlert('No tienes permisos de administrador', 'error');
    }
}

// Exportar funciones para uso global
window.auth = {
    isAdmin: isCurrentUserAdmin,
    getUser: getCurrentUserInfo,
    debugUsers: debugUsers,
    encryption: passwordEncryption
};
