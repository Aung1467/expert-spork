function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const id = getParam("id");
const memoryData = JSON.parse(localStorage.getItem(id));
const now = Date.now();

if (!memoryData) {
  document.getElementById("memoryBox").innerHTML = "<h3>Memory not found 🥲</h3>";
} else if (now > memoryData.expireAt) {
  document.getElementById("memoryBox").style.display = "none";
  document.getElementById("expiredBox").style.display = "block";

  document.getElementById("watchAdBtn").addEventListener("click", () => {
    alert("🎬 Watching Ad...");
    memoryData.expireAt = now + 24 * 60 * 60 * 1000;
    localStorage.setItem(id, JSON.stringify(memoryData));
    alert("✅ Memory unlocked for another 24h!");
    location.reload();
  });
} else {
  document.getElementById("photo").src = memoryData.photoURL;
  document.getElementById("message").textContent = memoryData.message;

  const music = document.getElementById("musicPlayer");
  music.src = memoryData.musicURL || "assets/default_music.mp3";

  const label = document.getElementById("memoryTypeLabel");
  const icons = {
    couple: "💞 Couple Memory",
    wedding: "💍 Wedding Moment",
    birthday: "🎂 Birthday Celebration",
    anniversary: "💐 Anniversary Love",
  };
  label.textContent = icons[memoryData.type] || "✨ Memory ✨";
}