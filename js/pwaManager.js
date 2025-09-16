export function initPWA() {
  // --- Notification Requests ---
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }

  // --- Install Button for Desktop ---
  const installBtn = document.querySelector("#install-btn");
  installBtn.style.display = "none"; // hide by default
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "block"; // show desktop install button
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

  // --- Mobile Install Instructions ---
  function isMobile() {
    return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
  }

  function isInStandaloneMode() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone
    );
  }

  if (isMobile() && !isInStandaloneMode()) {
    const mainDiv = document.querySelector(".w-full.max-w-lg.space-y-2");
    if (mainDiv) {
      const banner = document.createElement("div");
      banner.className = "relative p-3 mt-4 color-green rounded text-left"; // relative positioning for X
      banner.innerHTML = `
  <button class="absolute top-2 right-2 font-bold text-white">✕</button>
  <ul class="list-disc pl-4 space-y-1">
    <li>If no download button: Go to your browser settings and select "Add to Home" or "Install App".</li>
    <li>Visit the app once with internet to allow caching.</li>
    <li>On iOS, using Safari is recommended for an easier “Add to Home Screen” experience.</li>
  </ul>
`;

      mainDiv.appendChild(banner);

      // Dismiss button
      const closeBtn = banner.querySelector("button");
      closeBtn.addEventListener("click", () => banner.remove());
    }
  }
}
