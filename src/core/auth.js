// ===================================
// Authentication Module
// ===================================

// Decode helper
const _u = s => atob(s);
const __S = _u('bG9naW5hZG1pbmlzdHJhZG9y');
const __P = _u('YWRtaW4xMjM=');

// Security: Disable right-click and dev tools shortcuts
export function initializeSecurityMeasures() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.onkeydown = e => {
        if (e.keyCode == 123) return false; // F12
        if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) return false; // Ctrl+Shift+I/J/C
        if (e.ctrlKey && e.keyCode == 85) return false; // Ctrl+U
    };
}

/**
 * Authentication system
 */
export const auth = {
    users: [
        { email: 'admin@arqura.co', pass: __P, name: 'Admin', role: 'admin' }
    ],

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} pass - User password
     * @returns {Object|null} Session object or null if invalid
     */
    login(email, pass) {
        const u = this.users.find(x => x.email === email && x.pass === pass);
        if (!u) return null;
        const session = { name: u.name, email: u.email, role: u.role };
        return session;
    },

    /**
     * Logout user
     * @returns {null}
     */
    logout() {
        return null;
    }
};
