// soundManager.js
export function initSoundManager() {
  const soundSelector = document.getElementById("sound-selector");
  const uploadInput = document.getElementById("upload-sound");
  const testSoundBtn = document.getElementById("test-sound");

  const dbName = "RandoroSounds";
  let db;

  const request = indexedDB.open(dbName, 1);

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("sounds")) {
      db.createObjectStore("sounds", { keyPath: "name" });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    loadStoredSounds();
  };

  request.onerror = (event) => {
    console.error("IndexedDB error:", event.target.error);
  };

  testSoundBtn.addEventListener("click", () => {
    const soundFile = soundSelector.value;
    const audioSrc = soundFile.startsWith("blob:")
      ? soundFile
      : `./sounds/${soundFile}`;
    new Audio(audioSrc).play();
  });

  uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const blobURL = URL.createObjectURL(file);

    const newOption = document.createElement("option");
    newOption.value = blobURL;
    newOption.textContent = file.name;
    newOption.selected = true;
    soundSelector.appendChild(newOption);

    saveSoundToDB(file);
  });

  function saveSoundToDB(file) {
    const transaction = db.transaction(["sounds"], "readwrite");
    const store = transaction.objectStore("sounds");

    const soundData = { name: file.name, blob: file };
    const req = store.put(soundData);

    req.onsuccess = () => console.log(`${file.name} saved in IndexedDB`);
    req.onerror = (e) => console.error("Failed to save sound:", e.target.error);
  }

  function loadStoredSounds() {
    const transaction = db.transaction(["sounds"], "readonly");
    const store = transaction.objectStore("sounds");
    const req = store.getAll();

    req.onsuccess = (event) => {
      const storedSounds = event.target.result;
      storedSounds.forEach((sound) => {
        const blobURL = URL.createObjectURL(sound.blob);
        const option = document.createElement("option");
        option.value = blobURL;
        option.textContent = sound.name;
        soundSelector.appendChild(option);
      });
    };
  }
}
