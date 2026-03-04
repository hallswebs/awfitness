/* ============================================
   AW FITNESS - Authentication System
   Simple client-side auth for member/staff access
   ============================================ */

const AWAuth = {
    // Default staff account (change password after first login)
    STAFF_ACCOUNTS: [
        { username: 'alfie', password: 'AWFitness2026!', role: 'staff', name: 'Alfie Winter' }
    ],

    // Storage keys
    MEMBERS_KEY: 'aw_members',
    SESSION_KEY: 'aw_session',

    // Initialize — load members from localStorage
    init() {
        if (!localStorage.getItem(this.MEMBERS_KEY)) {
            localStorage.setItem(this.MEMBERS_KEY, JSON.stringify([]));
        }
    },

    // Get all members
    getMembers() {
        this.init();
        return JSON.parse(localStorage.getItem(this.MEMBERS_KEY));
    },

    // Add a new member (staff only)
    addMember(username, password, name, programmes) {
        const members = this.getMembers();
        if (members.find(m => m.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'Username already exists' };
        }
        members.push({
            username: username.toLowerCase(),
            password: password,
            name: name,
            programmes: programmes || [],
            role: 'member',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
        return { success: true, message: 'Member created successfully' };
    },

    // Remove a member
    removeMember(username) {
        let members = this.getMembers();
        members = members.filter(m => m.username.toLowerCase() !== username.toLowerCase());
        localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
        return { success: true };
    },

    // Update member programmes
    updateMemberProgrammes(username, programmes) {
        const members = this.getMembers();
        const member = members.find(m => m.username.toLowerCase() === username.toLowerCase());
        if (!member) return { success: false, message: 'Member not found' };
        member.programmes = programmes;
        localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
        return { success: true };
    },

    // Update member password
    updateMemberPassword(username, newPassword) {
        const members = this.getMembers();
        const member = members.find(m => m.username.toLowerCase() === username.toLowerCase());
        if (!member) return { success: false, message: 'Member not found' };
        member.password = newPassword;
        localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
        return { success: true };
    },

    // Login
    login(username, password) {
        // Check staff accounts
        const staff = this.STAFF_ACCOUNTS.find(
            s => s.username.toLowerCase() === username.toLowerCase() && s.password === password
        );
        if (staff) {
            const session = { username: staff.username, name: staff.name, role: 'staff', loggedInAt: new Date().toISOString() };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, role: 'staff', name: staff.name };
        }

        // Check member accounts
        const members = this.getMembers();
        const member = members.find(
            m => m.username.toLowerCase() === username.toLowerCase() && m.password === password
        );
        if (member) {
            const session = { username: member.username, name: member.name, role: 'member', programmes: member.programmes, loggedInAt: new Date().toISOString() };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, role: 'member', name: member.name, programmes: member.programmes };
        }

        return { success: false, message: 'Invalid username or password' };
    },

    // Get current session
    getSession() {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    // Logout
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },

    // Check if logged in
    isLoggedIn() {
        return this.getSession() !== null;
    },

    // Check role
    isStaff() {
        const session = this.getSession();
        return session && session.role === 'staff';
    },

    isMember() {
        const session = this.getSession();
        return session && session.role === 'member';
    },

    // Check if member has access to a programme
    hasProgramme(programmeId) {
        const session = this.getSession();
        if (!session) return false;
        if (session.role === 'staff') return true;
        // Refresh from stored members data for latest programmes
        const members = this.getMembers();
        const member = members.find(m => m.username === session.username);
        return member && member.programmes && member.programmes.includes(programmeId);
    },

    // Protect a page — redirect if not authorized
    requireAuth(allowedRoles) {
        const session = this.getSession();
        if (!session || !allowedRoles.includes(session.role)) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};
