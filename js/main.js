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

  // Outbound link tracking (GoatCounter events).
  // Download buttons already use data-goatcounter-click, so they are skipped here.
  // Event names: outbound-discord, outbound-patreon, outbound-x,
  // outbound-github-<repo> (or outbound-github for the org page).
  function outboundEvent(a) {
    var host = (a.hostname || "").toLowerCase().replace(/^www\./, "");
    if (!host || host === location.hostname.replace(/^www\./, "")) return null;
    if (host === "discord.gg" || host === "discord.com") return "outbound-discord";
    if (host === "patreon.com") return "outbound-patreon";
    if (host === "x.com" || host === "twitter.com") return "outbound-x";
    if (host === "github.com") {
      var parts = a.pathname.split("/").filter(Boolean);
      return parts.length > 1 ? "outbound-github-" + parts[1].toLowerCase() : "outbound-github";
    }
    return null;
  }
  function onOutbound(e) {
    if (e.type === "auxclick" && e.button !== 1) return;
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.hasAttribute("data-goatcounter-click")) return;
    var name = outboundEvent(a);
    if (!name || !window.goatcounter || !window.goatcounter.count) return;
    window.goatcounter.count({
      path: name,
      title: a.href,
      referrer: location.pathname,
      event: true
    });
  }
  document.addEventListener("click", onOutbound, true);
  document.addEventListener("auxclick", onOutbound, true);

  // GitHub download count (client-side, cached for an hour, hidden on any failure
  // or while the total is below data-min).
  document.querySelectorAll("[data-gh-repo]").forEach(function (el) {
    var repo = el.getAttribute("data-gh-repo");
    var min = parseInt(el.getAttribute("data-min") || "0", 10);
    var key = "ghdl:" + repo;
    function show(total) {
      if (typeof total !== "number" || total < min) return;
      el.textContent = "Downloaded " + total.toLocaleString("en-US") + " times from GitHub Releases.";
      el.hidden = false;
    }
    try {
      var c = JSON.parse(sessionStorage.getItem(key) || "null");
      if (c && Date.now() - c.t < 3600000) { show(c.n); return; }
    } catch (err) {}
    if (!window.fetch) return;
    fetch("https://api.github.com/repos/" + repo + "/releases?per_page=100", {
      headers: { "Accept": "application/vnd.github+json" }
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (releases) {
      var total = 0;
      releases.forEach(function (rel) {
        (rel.assets || []).forEach(function (as) {
          if (/\.(appimage|exe|zip|msi|dmg)$/i.test(as.name)) total += as.download_count || 0;
        });
      });
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), n: total })); } catch (err) {}
      show(total);
    }).catch(function () { /* rate-limited or offline: stay hidden */ });
  });
})();
