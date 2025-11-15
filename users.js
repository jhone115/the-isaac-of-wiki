// users-manager.js - Gestión de usuarios en JSON simulado
class UsersManager {
    constructor() {
        this.storageKey = 'isaac_wiki_users';
        this.init();
    }

    init() {
        // Inicializar usuarios si no existen
        if (!this.getUsers()) {
            const defaultUsers = {
                users: [
                    {
                        id: 1,
                        username: "admin",
                        email: "admin@isaacwiki.com",
                        password: this.encryptPassword("admin123"),
                        isAdmin: true,
                        registrationDate: new Date().toISOString(),
                        lastLogin: null
                    }
                ],
                nextId: 2
            };
            this.saveUsers(defaultUsers);
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    saveUsers(usersData) {
        localStorage.setItem(this.storageKey, JSON.stringify(usersData));
    }

    encryptPassword(password) {
        // Usar el sistema de encriptación que ya tenemos
        if (window.passwordEncryption) {
            return passwordEncryption.encrypt(password);
        }
        // Fallback simple
        return btoa(unescape(encodeURIComponent(password + 'isaac_salt')));
    }

    verifyPassword(password, encryptedPassword) {
        if (window.passwordEncryption) {
            return passwordEncryption.verify(password, encryptedPassword);
        }
        // Fallback simple
        return this.encryptPassword(password) === encryptedPassword;
    }

    userExists(username, email = null) {
        const usersData = this.getUsers();
        return usersData.users.some(user => 
            user.username === username || (email && user.email === email)
        );
    }

    addUser(userData) {
        const usersData = this.getUsers();
        const newUser = {
            id: usersData.nextId++,
            username: userData.username,
            email: userData.email,
            password: this.encryptPassword(userData.password),
            isAdmin: userData.isAdmin || false,
            registrationDate: new Date().toISOString(),
            lastLogin: null
        };

        usersData.users.push(newUser);
        this.saveUsers(usersData);
        return newUser;
    }

    authenticate(username, password) {
        const usersData = this.getUsers();
        const user = usersData.users.find(u => u.username === username);
        
        if (user && this.verifyPassword(password, user.password)) {
            // Actualizar último login
            user.lastLogin = new Date().toISOString();
            this.saveUsers(usersData);
            return user;
        }
        return null;
    }

    getUserByUsername(username) {
        const usersData = this.getUsers();
        return usersData.users.find(u => u.username === username);
    }

    getAllUsers() {
        const usersData = this.getUsers();
        return usersData.users.map(user => ({
            ...user,
            password: undefined // No devolver contraseñas
        }));
    }

    exportUsers() {
        return JSON.stringify(this.getUsers(), null, 2);
    }

    importUsers(jsonData) {
        try {
            const usersData = JSON.parse(jsonData);
            this.saveUsers(usersData);
            return true;
        } catch (error) {
            console.error('Error importing users:', error);
            return false;
        }
    }
}

// Crear instancia global
const usersManager = new UsersManager();