"use strict";

const illustrationRoot = document.documentElement;
const illustrationSection = document.getElementById("projets");
const illustrationPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const illustrationSpeed = document.querySelector("[data-demo-speed]");
const illustrationSpeedArc = document.querySelector("[data-speed-arc]");
const illustrationBattery = document.querySelector("[data-demo-battery]");
const illustrationBatteryArc = document.querySelector("[data-battery-arc]");
const illustrationDistance = document.querySelector("[data-demo-distance]");
const illustrationSpeedGauge = document.querySelector(".speed-gauge");
const illustrationBatteryGauge = document.querySelector(".battery-gauge");
const illustrationCluster = document.querySelector(".vehicle-cluster");
const illustrationSignals = [...document.querySelectorAll("[data-signal]")];
const illustrationDistanceFormat = new Intl.NumberFormat(document.documentElement.lang === "en" ? "en-GB" : "fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
let illustrationPaused = illustrationPreference.matches;
let illustrationVisible = false;
let illustrationTimer = null;
let illustrationTime = 0;
let illustrationKilometres = 12548;

function updateDashboard(speed) {
  const battery = Math.max(0, 78 - Math.floor((illustrationKilometres - 12548) / 4));
  if (illustrationSpeed) illustrationSpeed.textContent = String(speed);
  if (illustrationSpeedArc) illustrationSpeedArc.style.strokeDashoffset = String(100 - speed / 160 * 100);
  if (illustrationBattery) illustrationBattery.textContent = String(battery);
  if (illustrationBatteryArc) illustrationBatteryArc.style.strokeDashoffset = String(100 - battery);
  if (illustrationDistance) illustrationDistance.textContent = illustrationDistanceFormat.format(illustrationKilometres);
  if (illustrationSpeedGauge) {
    illustrationSpeedGauge.setAttribute("aria-valuenow", String(speed));
    illustrationSpeedGauge.setAttribute("aria-valuetext", `${speed} km/h`);
  }
  if (illustrationBatteryGauge) {
    illustrationBatteryGauge.setAttribute("aria-valuenow", String(battery));
    illustrationBatteryGauge.setAttribute("aria-valuetext", `${battery} %`);
  }
}

illustrationSignals.forEach((button) => {
  button.addEventListener("click", () => {
    const requested = button.dataset.signal;
    const mode = illustrationCluster.dataset.signalMode === requested ? "off" : requested;
    illustrationCluster.dataset.signalMode = mode;
    illustrationSignals.forEach((signal) => {
      signal.setAttribute("aria-pressed", String(signal.dataset.signal === mode));
    });
  });
});

updateDashboard(65);

function refreshIllustrationPlayback() {
  illustrationRoot.dataset.projectMotion = illustrationPaused ? "paused" : "running";
  illustrationRoot.dataset.projectVisible = String(illustrationVisible && !document.hidden);
  if (illustrationTimer !== null) {
    window.clearInterval(illustrationTimer);
    illustrationTimer = null;
  }

  if (!illustrationPaused && illustrationVisible && !document.hidden && illustrationSpeed && illustrationSpeedArc) {
    illustrationTimer = window.setInterval(() => {
      illustrationTime += .18;
      const speed = Math.round(62 + 23 * Math.sin(illustrationTime / 3));
      illustrationKilometres += speed * .18 / 3600;
      updateDashboard(speed);
    }, 180);
  }
}

if (illustrationSection) {
  illustrationPreference.addEventListener("change", (event) => {
    illustrationPaused = event.matches;
    refreshIllustrationPlayback();
  });

  document.addEventListener("visibilitychange", refreshIllustrationPlayback);

  if ("IntersectionObserver" in window) {
    const illustrationObserver = new IntersectionObserver(([entry]) => {
      illustrationVisible = entry.isIntersecting;
      refreshIllustrationPlayback();
    });
    illustrationObserver.observe(illustrationSection);
  } else {
    illustrationVisible = true;
  }

  refreshIllustrationPlayback();
}
