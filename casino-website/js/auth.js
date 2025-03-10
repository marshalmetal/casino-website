// DOM Elements
const authButtons = document.getElementById('auth-buttons');
const userInfo = document.getElementById('user-info');
const authForms = document.getElementById('auth-forms');
const gamesSection = document.getElementById('games-section');

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        showUserInterface(user);
        loadUserData(user.uid);
    } else {
        // User is signed out
        showAuthInterface();
    }
});

// Show/hide UI elements based on auth state
function showUserInterface(user) {
    authButtons.classList.add('hidden');
    authForms.classList.add('hidden');
    userInfo.classList.remove('hidden');
    gamesSection.classList.remove('hidden');
}

function showAuthInterface() {
    authButtons.classList.remove('hidden');
    userInfo.classList.add('hidden');
    gamesSection.classList.add('hidden');
}

// Load user data from Firebase
function loadUserData(userId) {
    const userRef = database.ref('users/' + userId);
    userRef.once('value').then(snapshot => {
        const userData = snapshot.val() || { balance: 1000 };
        document.getElementById('user-balance').textContent = `Balance: $${userData.balance}`;
    });
}

// Sign up functionality
document.getElementById('signup-btn').addEventListener('click', () => {
    authForms.classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
});

document.getElementById('signup-submit').addEventListener('click', () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Initialize user data in the database
            return database.ref('users/' + user.uid).set({
                email: user.email,
                balance: 1000
            });
        })
        .catch((error) => {
            alert('Error: ' + error.message);
        });
});

// Login functionality
document.getElementById('login-btn').addEventListener('click', () => {
    authForms.classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

document.getElementById('login-submit').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            alert('Error: ' + error.message);
        });
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
});