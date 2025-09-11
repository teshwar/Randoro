export function initFontManager() {
  const fonts = [
    { name: "Default (m6x11)", value: "m6x11, monospace" }, // default font
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
    { name: "Tahoma", value: "Tahoma, sans-serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Times New Roman", value: "Times New Roman, serif" },
    { name: "Courier New", value: "Courier New, monospace" },
  ];

  const fontBtn = document.querySelector("#font-btn");
  fontBtn.addEventListener("click", () => showFontChooser());

  function showFontChooser() {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50";
    modal.innerHTML = `
      <div class="bg-gray-800 p-6 rounded shadow-lg flex flex-col space-y-2 w-72">
        <p class="text-white text-lg font-bold text-center mb-2">Choose a Font</p>
        ${fonts
          .map(
            (f) =>
              `<button class="py-1 px-2 text-white bg-blue-500 rounded hover:opacity-90" data-font="${f.value}">${f.name}</button>`
          )
          .join("")}
        <button id="close-font-modal" class="mt-2 py-1 px-2 bg-red-500 text-white rounded hover:opacity-90">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll("button[data-font]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.body.style.fontFamily = btn.dataset.font;
        localStorage.setItem("user-font", btn.dataset.font);
        modal.remove();
      });
    });

    modal.querySelector("#close-font-modal").addEventListener("click", () => {
      modal.remove();
    });
  }

  // Load saved font on page load
  const savedFont = localStorage.getItem("user-font");
  if (savedFont) document.body.style.fontFamily = savedFont;
}
