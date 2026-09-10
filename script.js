// Switches every [data-i18n] element to the given language and remembers the choice.
// `translations` comes from i18n.js, loaded before this script.
function applyLanguage(lang) {
  const dict = translations[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
  document.documentElement.lang = lang;

  // Highlight the active FR/EN button.
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });

  try {
    localStorage.setItem("resume-lang", lang);
  } catch (e) {
    // localStorage can be unavailable (private browsing, disabled storage) - ignore.
  }
}

// Language toggle buttons in the toolbar.
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

// "Download PDF" opens the browser print dialog, which uses print.css
// and lets the user save it as a PDF (no external library needed).
document.getElementById("pdf-btn").addEventListener("click", () => {
  window.print();
});

// On load, restore the last chosen language if we have one, otherwise default to French.
let initialLang = "fr";
try {
  const saved = localStorage.getItem("resume-lang");
  if (saved === "fr" || saved === "en") {
    initialLang = saved;
  }
} catch (e) {
  // localStorage can be unavailable (private browsing, disabled storage) - ignore.
}
applyLanguage(initialLang);
