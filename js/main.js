(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Placeholder download buttons: prevent navigation until wired up
  document.querySelectorAll("a.btn-download[href='#']").forEach(function (a) {
    a.setAttribute("aria-disabled", "true");
    a.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });
})();
