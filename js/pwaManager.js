// js/pwaManager.js
export function initPWA() {
  const installBtn = document.querySelector("#install-btn");
  installBtn.style.display = "none"; // hide until prompt is ready

  // --- PWA Install Prompt ---
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "block";
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("PWA installed");
    } else {
      console.log("PWA install dismissed");
    }
    deferredPrompt = null;
    installBtn.style.display = "none";
  });

  // Hide button by default
  installBtn.style.display = "none";

  // --- Service Worker Registration ---
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => console.log("Service Worker registered"))
        .catch((err) =>
          console.error("Service Worker registration failed:", err)
        );
    });
  }
}
