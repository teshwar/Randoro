// Test already present sounds
document.querySelector("#test-sound").addEventListener("click", () => {
  let soundFile = document.querySelector("#sound-selector").value;
  new Audio(`./sounds/${soundFile}`).play();
});
