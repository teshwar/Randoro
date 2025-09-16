export function initSoundManager() {
  const soundSelector = document.getElementById("sound-selector");
  const uploadInput = document.getElementById("upload-sound");
  const testSoundBtn = document.getElementById("test-sound");

  // Add Stop button dynamically
  const stopSoundBtn = document.createElement("button");
  stopSoundBtn.textContent = "Stop";
  stopSoundBtn.className = "color-red px-3 py-1 rounded hover:opacity-80 w-1/5";
  testSoundBtn.parentNode.appendChild(stopSoundBtn);

  let currentAudio = null; // store currently playing audio

  // Play selected sound
  testSoundBtn.addEventListener("click", () => {
    // Stop previous audio if any
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const soundFile = soundSelector.value;
    const audioSrc = soundFile.startsWith("blob:")
      ? soundFile
      : `./sounds/${soundFile}`;

    currentAudio = new Audio(audioSrc);
    currentAudio.play();
  });

  // Stop current audio
  stopSoundBtn.addEventListener("click", () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  });

  // --- IndexedDB for uploaded sounds ---
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
    store.put({ name: file.name, blob: file }).onsuccess = () =>
      console.log(`${file.name} saved in IndexedDB`);
  }

  function loadStoredSounds() {
    const transaction = db.transaction(["sounds"], "readonly");
    const store = transaction.objectStore("sounds");
    store.getAll().onsuccess = (event) => {
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
