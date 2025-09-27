


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBQtlCxwhIXyKxuW5FRyRqOElCz-2_EPjs",
  authDomain: "redcross-76c90.firebaseapp.com",
  projectId: "redcross-76c90",
  storageBucket: "redcross-76c90.firebasestorage.app",
  messagingSenderId: "720435310423",
  appId: "1:720435310423:web:058f8f14743135da62d812",
  measurementId: "G-1N1LDV3R95",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Elements
const candidatesContainer = document.getElementById("candidatesContainer");
const voteBtn = document.getElementById("voteBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const authSection = document.getElementById("authSection");
const votingSection = document.getElementById("votingSection");
const userInfo = document.getElementById("userInfo");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

// Kandidat
const candidates = [
  {
    id: "rangga",
    name: "Muhammad Rangga",
    position: "Calon Ketua PMR",
    vision:
      "Mewujudkan PMR yang solid, kreatif, peduli, dan bermanfaat bagi sesama, serta menjadi wadah pengembangan diri anggota yang berlandaskan nilai kemanusiaan.",
    mission: [
      "Menguatkan solidaritas dan kekompakan antaranggota melalui kegiatan yang melatih kerja sama dan kepedulian.",
      "Mengembangkan keterampilan anggota di bidang pertolongan pertama, kesehatan remaja, dan kepemimpinan.",
      "Menanamkan nilai kemanusiaan dan kepedulian sosial melalui aksi nyata, seperti donor darah, bakti sosial, dan kampanye kesehatan.",
      "Membangun komunikasi yang baik antara pengurus, anggota, guru pembina, dan organisasi lain di sekolah.",
    ],
    image: "/rangga.jpg",
  },
  {
    id: "ghazi",
    name: "Ghazi",
    position: "Calon Ketua PMR",
    vision:
      "Menjadikan PMR sebagai organisasi yang layak, terstruktur, dan menjadi teladan dalam bidang kesehatan.",
    mission: [
      "Membuat prosedur yang jelas untuk siswa yang sakit.",
      "Memperbaiki komunikasi diantara para anggota agar dapat bekerja sama dengan baik.",
      "Memperlayak fasilitas UKS.",
      "Menjadikan anggota PMR paham tentang kesehatan.",
      "Membawa pengaruh baik tentang kesehatan untuk seluruh warga sekolah.",
    ],
    image: "/ghazi.png",
  },
];

// State
let selectedCandidate = null;
let currentUser = null;
let hasVoted = false;
let votingStep = 0;

// --- Utility Functions ---
function updateProgress(step) {
  votingStep = step;
  const steps = ["Masuk", "Pilih Kandidat", "Konfirmasi", "Selesai"];
  const percentage = (step / (steps.length - 1)) * 100;

  progressBar.style.width = percentage + "%";
  progressText.textContent = steps[step] || "Selesai";
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${
      type === "success"
        ? "fa-check-circle"
        : type === "warning"
        ? "fa-exclamation-triangle"
        : "fa-info-circle"
    }"></i>
    ${message}
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 100);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// --- Candidate Functions ---
function loadCandidates() {
  candidatesContainer.innerHTML = "";

  candidates.forEach((candidate) => {
    const missionList = candidate.mission
      .map((m) => `<li><i class="fas fa-check-circle"></i> ${m}</li>`)
      .join("");

    const card = document.createElement("div");
    card.className = "candidate-card";
    card.dataset.id = candidate.id;

    card.innerHTML = `
      <div class="candidate-image-container">
        <img src="${candidate.image}" alt="${candidate.name}" class="candidate-image">
      </div>
      <div class="candidate-content">
        <div class="candidate-name">${candidate.name}</div>
        <div class="candidate-position">${candidate.position}</div>
        <div class="candidate-vision">
          <h4><i class="fas fa-eye"></i> Visi:</h4>
          <p>${candidate.vision}</p>
        </div>
        <div class="candidate-mission">
          <h4><i class="fas fa-list-check"></i> Misi:</h4>
          <ul>${missionList}</ul>
        </div>
      </div>
      <div class="candidate-select-btn">
        <i class="fas fa-vote-yea"></i> Pilih Kandidat
      </div>
    `;

    card.addEventListener("click", () => selectCandidate(candidate.id));
    candidatesContainer.appendChild(card);
  });
}

function selectCandidate(candidateId) {
  if (hasVoted) {
    showNotification("Anda sudah memberikan suara!", "warning");
    return;
  }

  document.querySelectorAll(".candidate-card").forEach((c) =>
    c.classList.remove("selected")
  );

  const selectedCard = document.querySelector(`[data-id="${candidateId}"]`);
  selectedCard.classList.add("selected");

  selectedCandidate = candidateId;
  const candidate = candidates.find((c) => c.id === candidateId);

  voteBtn.disabled = false;
  voteBtn.innerHTML = `<i class="fas fa-vote-yea"></i> Pilih ${candidate.name}`;
  updateProgress(2);
}

// --- Voting Functions ---
async function checkUserVoteStatus(userId) {
  const voteDoc = await getDoc(doc(db, "votes", userId));
  if (voteDoc.exists()) {
    hasVoted = true;
    showAlreadyVoted(voteDoc.data());
    return true;
  }
  return false;
}

function showAlreadyVoted(voteData) {
  updateProgress(3);
  const candidate = candidates.find((c) => c.id === voteData.candidateId);

  userInfo.innerHTML = `
    <div class="vote-status-card">
      <h3>Suara Berhasil Tersimpan!</h3>
      <div class="voted-candidate">
        <img src="${candidate.image}" alt="${candidate.name}">
        <div>
          <div>${candidate.name}</div>
          <div>${candidate.position}</div>
        </div>
      </div>
    </div>
  `;

  voteBtn.style.display = "none";
  document.querySelectorAll(".candidate-card").forEach((c) => {
    c.classList.add("disabled");
    c.style.pointerEvents = "none";
  });
}

async function handleVote() {
  if (!selectedCandidate) {
    showNotification("Silakan pilih kandidat terlebih dahulu!", "warning");
    return;
  }

  const candidate = candidates.find((c) => c.id === selectedCandidate);

  await setDoc(doc(db, "votes", currentUser.uid), {
    userId: currentUser.uid,
    userEmail: currentUser.email,
    userName: currentUser.displayName,
    candidateId: selectedCandidate,
    candidateName: candidate.name,
    timestamp: new Date(),
  });

  hasVoted = true;
  showNotification(`Suara untuk ${candidate.name} berhasil tersimpan.`, "success");
  showAlreadyVoted({ candidateId: selectedCandidate });
}

// --- Auth Functions ---
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    showNotification("Berhasil masuk!", "success");
  } catch (error) {
    showNotification("Gagal masuk: " + error.message, "warning");
  }
}

async function signOutUser() {
  await signOut(auth);
  currentUser = null;
  selectedCandidate = null;
  hasVoted = false;
  updateProgress(0);

  voteBtn.disabled = true;
  voteBtn.innerHTML = `<i class="fas fa-vote-yea"></i> Pilih Kandidat`;
  showNotification("Berhasil keluar", "success");
}


// --- UI Update ---
async function updateUI(user) {
  if (user) {
    authSection.style.display = "none";
    votingSection.style.display = "block";
    updateProgress(1);

    const alreadyVoted = await checkUserVoteStatus(user.uid);
    if (!alreadyVoted) {
      userInfo.innerHTML = `
        <div class="user-profile">
          <img src="${
            user.photoURL ||
            "https://via.placeholder.com/60x60/dc2626/ffffff?text=" +
              user.displayName.charAt(0)
          }" alt="Profile" class="user-avatar">
          <div>${user.displayName}</div>
          <div>${user.email}</div>
        </div>
      `;
    }
  } else {
    authSection.style.display = "block";
    votingSection.style.display = "none";
    userInfo.innerHTML = "";
    updateProgress(0);
  }
}
```


// --- Event Listeners ---
googleSignInBtn.addEventListener("click", signInWithGoogle);
signOutBtn.addEventListener("click", signOutUser);
voteBtn.addEventListener("click", handleVote);

// Auth state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateUI(user);
});

// Init
loadCandidates();
updateProgress(0);
```
