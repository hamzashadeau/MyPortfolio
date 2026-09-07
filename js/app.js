/* ============================================================
   Portfolio — Bouigrouane Hamza
   Interactions : langue FR/EN, navigation, revelations, formulaire
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- 1. Bascule de langue ---------- */

  var META = {
    fr: {
      title: "Bouigrouane Hamza — Ingénieur Développeur Java / Python",
      desc: "Ingénieur développeur Java / Python, 4 ans d'expérience. APIs sécurisées à fort trafic (50 000+ utilisateurs), architecture microservices, data science et agents IA."
    },
    en: {
      title: "Bouigrouane Hamza — Java / Python Software Engineer",
      desc: "Java / Python software engineer, 4 years of experience. Secure high-traffic APIs (50,000+ users), microservice architecture, data science and AI agents."
    }
  };

  function applyLang(lang) {
    if (lang !== "fr" && lang !== "en") lang = "fr";

    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);

    document.title = META[lang].title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", META[lang].desc);

    // Boutons FR / EN
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-set-lang") === lang);
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-lang") === lang));
    });

    // Placeholders du formulaire
    document.querySelectorAll("[data-ph-" + lang + "]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute("data-ph-" + lang));
    });

    // Textes alternatifs des images : eux aussi doivent suivre la langue.
    document.querySelectorAll("[data-alt-" + lang + "]").forEach(function (el) {
      el.setAttribute("alt", el.getAttribute("data-alt-" + lang));
    });

    try { localStorage.setItem("portfolio-lang", lang); } catch (e) { /* stockage indisponible */ }
  }

  var saved = null;
  try { saved = localStorage.getItem("portfolio-lang"); } catch (e) { /* stockage indisponible */ }
  if (!saved) {
    saved = (navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
  }
  applyLang(saved);

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-set-lang"));
    });
  });

  /* ---------- 2. Barre de navigation ---------- */

  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var toTop = document.getElementById("toTop");

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });

    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  }

  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-stuck", y > 12);
    if (toTop) toTop.classList.toggle("is-on", y > 700);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Lien actif selon la section visible ---------- */

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 4. Apparition au defilement ---------- */

  var reveals = document.querySelectorAll(".reveal");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // `i` est l'index dans le lot courant : sur un ecran tres haut, tous les
        // elements entrent d'un coup et le dernier attendrait plusieurs secondes.
        // On plafonne le decalage a 5 crans.
        setTimeout(function () { el.classList.add("is-in"); }, Math.min(i, 5) * 70);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Formulaire de contact (Netlify Forms, en AJAX) ---------- */

  var MSG = {
    sending: { fr: "Envoi en cours…", en: "Sending…" },
    ok: {
      fr: "Message envoyé. Je vous réponds sous 48 h.",
      en: "Message sent. I'll get back to you within 48 hours."
    },
    ko: {
      fr: "L'envoi a échoué. Écrivez-moi directement à bouigrouanehamza@gmail.com.",
      en: "Sending failed. Please email me directly at bouigrouanehamza@gmail.com."
    }
  };

  var form = document.getElementById("contactForm");
  var status = document.getElementById("cf-status");
  var submit = document.getElementById("cf-submit");

  function say(key, state) {
    if (!status) return;
    status.textContent = MSG[key][root.getAttribute("data-lang")] || MSG[key].fr;
    if (state) {
      status.setAttribute("data-state", state);
    } else {
      status.removeAttribute("data-state");
    }
    status.hidden = false;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      say("sending", null);
      if (submit) submit.disabled = true;

      // Netlify attend un corps url-encode contenant form-name, poste sur la page.
      var body = new URLSearchParams(new FormData(form)).toString();

      fetch(form.getAttribute("action") || window.location.pathname, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          say("ok", "ok");
        })
        .catch(function () {
          say("ko", "ko");
        })
        .then(function () {
          if (submit) submit.disabled = false;
        });
    });
  }

  /* ---------- 6. Annee courante ---------- */

  var year = String(new Date().getFullYear());
  ["year", "year-en"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = year;
  });
})();
