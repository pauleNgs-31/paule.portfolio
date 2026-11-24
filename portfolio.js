"use strict";

// Tous les contenus restent accessibles sans JavaScript.
document.documentElement.classList.add("js");
const portfolioIsEnglish = document.documentElement.lang === "en";

// Keep the same section when switching between the two static language pages.
document.querySelectorAll(".language-switch a").forEach((link) => {
  link.addEventListener("click", () => {
    link.href = link.getAttribute("href").split("#")[0] + window.location.hash;
  });
});

const backgroundVideo = document.querySelector(".hero-video");

if (backgroundVideo && backgroundVideo.canPlayType("video/mp4")) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let heroVisible = true;
  backgroundVideo.muted = true;

  function syncVideoPlayback() {
    if (!reducedMotion.matches && !navigator.connection?.saveData && heroVisible && !document.hidden) {
      if (!backgroundVideo.getAttribute("src")) {
        backgroundVideo.src = backgroundVideo.dataset.src;
      }
      backgroundVideo.play().catch(() => {});
    } else {
      backgroundVideo.pause();
    }
  }

  document.addEventListener("visibilitychange", syncVideoPlayback);
  reducedMotion.addEventListener("change", syncVideoPlayback);

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncVideoPlayback();
    }, { threshold: 0 });
    heroObserver.observe(document.querySelector(".hero-stage"));
  }

  syncVideoPlayback();
}

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");

function setMenu(open) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", portfolioIsEnglish ? (open ? "Close menu" : "Open menu") : (open ? "Fermer le menu" : "Ouvrir le menu"));
  navigation.classList.toggle("is-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) setMenu(false);
});

window.matchMedia("(min-width: 1001px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

const filterControls = document.querySelector(".project-controls");
const filters = [...document.querySelectorAll(".filter")];
const projects = [...document.querySelectorAll(".project-card")];
const projectCount = document.querySelector(".project-count");

if (filterControls && filters.length && projects.length) {
  filterControls.hidden = false;
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      let visibleCount = 0;
      projects.forEach((project) => {
        const categories = (project.dataset.categories || "").split(" ");
        const visible = selected === "all" || categories.includes(selected);
        project.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      filters.forEach((filter) => {
        const active = filter === button;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      if (projectCount) {
        projectCount.textContent = portfolioIsEnglish
          ? `${visibleCount} project${visibleCount === 1 ? "" : "s"}`
          : `${visibleCount} projet${visibleCount > 1 ? "s" : ""}`;
      }
    });
  });
}

if ("IntersectionObserver" in window) {
  const navLinks = [...document.querySelectorAll('.navigation a[href^="#"]')];
  const sections = navLinks.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
