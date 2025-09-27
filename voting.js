
// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQtlCxwhIXyKxuW5FRyRqOElCz-2_EPjs",
  authDomain: "redcross-76c90.firebaseapp.com",
  projectId: "redcross-76c90",
  storageBucket: "redcross-76c90.firebasestorage.app",
  messagingSenderId: "720435310423",
  appId: "1:720435310423:web:058f8f14743135da62d812",
  measurementId: "G-1N1LDV3R95"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM
const googleSignInBtn = document.getElementById('googleSignInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authSection = document.getElementById('authSection');
const votingSection = document.getElementById('votingSection');
const userInfo = document.getElementById('userInfo');
const voteBtn = document.getElementById('voteBtn');

let currentUser = null;
let hasVoted = false;

// --- LOGIN ---
async function signInWithGoogle() {
  try {
    googleSignInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Masuk...';
    googleSignInBtn.disabled = true;

    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    console.log("User signed in:", currentUser);
  } catch (error) {
    console.error("Error signing in:", error.message);
    alert("Login gagal: " + error.message);
  } finally {
    googleSignInBtn.innerHTML = '<i class="fab fa-google"></i> Masuk dengan Google';
    googleSignInBtn.disabled = false;
  }
}

// --- LOGOUT ---
async function signOutUser() {
  try {
    await signOut(auth);
    currentUser = null;
    hasVoted = false;
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
}

// --- CEK STATUS LOGIN ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    votingSection.style.display = "block";

    // cek apakah sudah vote
    const voteDoc = await getDoc(doc(db, "votes", user.uid));
    if (voteDoc.exists()) {
      hasVoted = true;
      voteBtn.disabled = true;
      voteBtn.textContent = "Anda sudah memilih";
    }

    userInfo.innerHTML = `
      <div class="user-profile">
        <img src="${user.photoURL}" class="user-avatar"/>
        <div>${user.displayName}</div>
        <div>${user.email}</div>
      </div>
    `;
  } else {
    authSection.style.display = "block";
    votingSection.style.display = "none";
    userInfo.innerHTML = "";
  }
});

// --- EVENT LISTENER ---
googleSignInBtn.addEventListener("click", signInWithGoogle);
signOutBtn.addEventListener("click", signOutUser);

document.getElementById('googleSignInBtn')
  .addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      alert("Berhasil login: " + result.user.displayName);
    } catch (err) {
      alert("Login gagal: " + err.message);
    }
});

onAuthStateChanged(auth, (user) => {
  const authSection = document.getElementById("authSection");
  const votingSection = document.getElementById("votingSection");

  if (user) {
    // Kalau sudah login → sembunyikan auth, tampilkan voting
    if (authSection) authSection.style.display = "none";
    if (votingSection) votingSection.style.display = "block";

    document.getElementById("userInfo").innerHTML = `
      <p>Halo, ${user.displayName} (${user.email})</p>
    `;
  } else {
    // Kalau logout → tampilkan auth, sembunyikan voting
    if (authSection) authSection.style.display = "block";
    if (votingSection) votingSection.style.display = "none";

    document.getElementById("userInfo").innerHTML = "";
  }
});
