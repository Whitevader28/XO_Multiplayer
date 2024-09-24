// Simulate route changes
window.addEventListener("hashchange", route);
function route() {
  const hash = window.location.hash;
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));

  if (hash === "#game") {
    document.getElementById("game-room").classList.add("active");
  } else {
    document.getElementById("menu").classList.add("active");
  }
}
