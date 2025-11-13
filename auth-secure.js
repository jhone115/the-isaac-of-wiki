// auth-secure.js - Sistema de encriptación para contraseñas

class PasswordEncryption {
    constructor() {
        // Clave de encriptación (puedes cambiarla)
        this.encryptionKey = '1015404491Ll*';
    }

    // Generar un hash simple para la contraseña
    encrypt(password) {
        try {
            // Método 1: Hash básico con clave secreta
            let hash = 0;
            const str = password + this.encryptionKey;
            
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convertir a 32-bit integer
            }
            
            // Añadir salt y convertir a hexadecimal
            const salt = Date.now().toString(36);
            const saltedHash = Math.abs(hash).toString(36) + salt;
            
            return saltedHash;
            
        } catch (error) {
            console.error('Error encriptando contraseña:', error);
            // Fallback: encriptación básica
            return btoa(unescape(encodeURIComponent(password + this.encryptionKey)));
        }
    }

    // Verificar si una contraseña coincide con el hash
    verify(password, hash) {
        try {
            const newHash = this.encrypt(password);
            return newHash === hash;
        } catch (error) {
            console.error('Error verificando contraseña:', error);
            return false;
        }
    }

    // Generar hash con método alternativo (más seguro)
    strongEncrypt(password) {
        try {
            // Usar Web Crypto API si está disponible
            if (window.crypto && window.crypto.subtle) {
                return this._cryptoHash(password);
            } else {
                // Fallback al método básico
                return this.encrypt(password);
            }
        } catch (error) {
            console.error('Error en encriptación fuerte:', error);
            return this.encrypt(password);
        }
    }

    // Método usando Web Crypto API (más seguro)
    async _cryptoHash(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + this.encryptionKey);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Verificar con Web Crypto API
    async strongVerify(password, hash) {
        try {
            const newHash = await this.strongEncrypt(password);
            return newHash === hash;
        } catch (error) {
            console.error('Error en verificación fuerte:', error);
            return this.verify(password, hash);
        }
    }

    // Validar fortaleza de contraseña
    validatePasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        
        return {
            score: score,
            maxScore: 5,
            isStrong: score >= 4,
            checks: checks
        };
    }

    // Generar contraseña aleatoria
    generateRandomPassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }
}

// Crear instancia global
const passwordEncryption = new PasswordEncryption();

// Exportar para uso global
window.PasswordEncryption = PasswordEncryption;
window.passwordEncryption = passwordEncryption;