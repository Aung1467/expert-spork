// Firebase SDKs Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Firebase Config (မင်းပေးထားတဲ့)
const firebaseConfig = {
  apiKey: "AIzaSyD2_Nus7hLG3MEbtoAnM1nzAdlF4kEwovI",
  authDomain: "memorymaker-e7e84.firebaseapp.com",
  projectId: "memorymaker-e7e84",
  storageBucket: "memorymaker-e7e84.firebasestorage.app",
  messagingSenderId: "170056478997",
  appId: "1:170056478997:web:25c04150c33a1f10aa791c",
  measurementId: "G-1BPNWLW24W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("✅ Firebase connected");

// ==========================
// 🎵 Search Song Function (Audius API)
// ==========================
async function searchSong(query) {
  try {
    const res = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${query}&app_name=MemoryMaker`);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].stream_url;
    } else {
      alert("No song found for: " + query);
      return "";
    }
  } catch (error) {
    console.error(error);
    alert("Error searching song");
    return "";
  }
}

// ==========================
// 💾 Save Memory to Firebase
// ==========================
async function saveMemory({ type, message, imageData, musicName }) {
  try {
    const expireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Upload Photo
    const photoRef = ref(storage, `photos/${Date.now()}.jpg`);
    await uploadString(photoRef, imageData, "data_url");
    const photoURL = await getDownloadURL(photoRef);

    // Get Music URL from API
    let musicURL = "";
    if (musicName) {
      musicURL = await searchSong(musicName);
    }

    // Save Data to Firestore
    const docRef = await addDoc(collection(db, "memories"), {
      type,
      message,
      photoURL,
      musicURL,
      expireAt,
    });

    // Create sharable link
    const shareLink = `${window.location.origin}/memory.html?id=${docRef.id}`;
    console.log("Memory saved:", shareLink);

    // Display to user
    document.getElementById("shareBox").innerHTML = `
      <p>Your memory is ready! 💖</p>
      <input type="text" value="${shareLink}" readonly style="width:100%;text-align:center">
      <p>Link will expire in 24 hours.</p>
    `;
  } catch (error) {
    console.error("Error saving memory:", error);
    alert("Something went wrong while saving your memory!");
  }
}

// ==========================
// 🕒 Auto Expire Link Checker
// ==========================
async function loadMemoryById(id) {
  try {
    const docRef = doc(db, "memories", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      if (Date.now() > data.expireAt) {
        document.body.innerHTML = `<h2>⏰ This memory has expired.</h2>`;
        return;
      }

      // Display memory
      document.body.innerHTML = `
        <div class="memory-box">
          <img src="${data.photoURL}" style="width:100%;border-radius:10px">
          <h3>${data.type.toUpperCase()}</h3>
          <p>${data.message}</p>
          ${data.musicURL ? `<audio controls src="${data.musicURL}"></audio>` : ""}
        </div>
      `;
    } else {
      document.body.innerHTML = `<h2>❌ Memory not found!</h2>`;
    }
  } catch (e) {
    console.error(e);
  }
}

// ==========================
// 🔄 Detect if viewing shared link
// ==========================
const params = new URLSearchParams(window.location.search);
if (params.has("id")) {
  const memoryId = params.get("id");
  loadMemoryById(memoryId);
}
document.getElementById("memoryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = document.getElementById("type").value;
  const message = document.getElementById("message").value;
  const musicName = document.getElementById("musicName").value;
  const file = document.getElementById("photoInput").files[0];

  const reader = new FileReader();
  reader.onload = async function() {
    const imageData = reader.result;
    await saveMemory({ type, message, imageData, musicName });
  };
  reader.readAsDataURL(file);
});