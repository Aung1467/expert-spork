// Firebase import (အရင်က မင်းရေးထားတာ 그대로)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2_Nus7hLG3MEbtoAnM1nzAdlF4kEwovI",
  authDomain: "memorymaker-e7e84.firebaseapp.com",
  projectId: "memorymaker-e7e84",
  storageBucket: "memorymaker-e7e84.firebasestorage.app",
  messagingSenderId: "170056478997",
  appId: "1:170056478997:web:25c04150c33a1f10aa791c",
  measurementId: "G-1BPNWLW24W"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

// ✅ Main logic
const form = document.getElementById("memoryForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // page refresh မဖြစ်အောင်

    const message = document.getElementById("message").value.trim();
    const photo = document.getElementById("photoInput").files[0];
    const musicName = document.getElementById("musicName").value.trim();
    const shareBox = document.getElementById("shareBox");

    shareBox.innerHTML = "<p>⏳ Creating your memory...</p>";

    // 🪄 Music Search via Deezer API
    if (musicName) {
      const proxy = "https://corsproxy.io/?";
      const res = await fetch(`${proxy}https://api.deezer.com/search?q=${encodeURIComponent(musicName)}`);
      const data = await res.json();

      if (data.data && data.data.length > 0) {
        const preview = data.data[0].preview;
        const title = data.data[0].title_short;
        shareBox.innerHTML += `
          <p>🎵 ${title}</p>
          <audio controls src="${preview}" loop autoplay></audio>
        `;
      } else {
        shareBox.innerHTML += "<p>❌ No song found.</p>";
      }
    }

    // 🖼️ Photo Preview
    if (photo) {
      const reader = new FileReader();
      reader.onload = () => {
        shareBox.innerHTML += `
          <img src="${reader.result}" alt="Memory Photo" style="width:100%;margin-top:10px;border-radius:10px;">
        `;
      };
      reader.readAsDataURL(photo);
    }

    // 💬 Message
    if (message) {
      shareBox.innerHTML += `<p style="margin-top:10px;">💬 ${message}</p>`;
    }

    shareBox.innerHTML += "<p>✅ Done! Your memory is ready 💖</p>";
  });
}