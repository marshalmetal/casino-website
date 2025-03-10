// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBHlaZ-xFh4lvgOdWr_ExRs9xavChhwxDg",
  authDomain: "my-project-in-react-2dd85.firebaseapp.com",
  projectId: "my-project-in-react-2dd85",
  storageBucket: "my-project-in-react-2dd85.firebasestorage.app",
  messagingSenderId: "360531007630",
  appId: "1:360531007630:web:759fd271dc8939cfe611df",
  measurementId: "G-Z16L5S3NX7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Export Firebase instances for use in other modules
window.auth = auth;
window.database = database;