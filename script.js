document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("🎶 เพลงของคุณถูกส่งเรียบร้อยแล้ว!");
    });
  }
});
