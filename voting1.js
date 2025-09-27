
// voting.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQtlCxwhIXyKxuW5FRyRqOElCz-2_EPjs",
  authDomain: "redcross-76c90.firebaseapp.com",
  projectId: "redcross-76c90",
  storageBucket: "redcross-76c90.appspot.com", // ✅ benar pakai .appspot.com
  messagingSenderId: "720435310423",
  appId: "1:720435310423:web:058f8f14743135da62d812",
  measurementId: "G-1N1LDV3R95"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Tombol Google Sign In
const googleSignInBtn = document.getElementById("googleSignInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const userInfo = document.getElementById("userInfo");

// Event klik login
if (googleSignInBtn) {
  googleSignInBtn.addEventListener("click", async () => {
    try {
      googleSignInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Masuk...';
      const result = await signInWithPopup(auth, provider);
      alert("Berhasil login sebagai: " + result.user.displayName);
    } catch (err) {
      alert("Login gagal: " + err.message);
    } finally {
      googleSignInBtn.innerHTML = '<i class="fab fa-google"></i> Masuk dengan Google';
    }
  });
}

// Event klik logout
if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("Berhasil keluar!");
  });
}

// Pantau status login
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.innerHTML = `
      <p>Halo, ${user.displayName} (${user.email})</p>
    `;
  } else {
    userInfo.innerHTML = "";
  }
});
```
