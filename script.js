function applyLanguage(lang) {
  const dict = translations[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
  try {
    localStorage.setItem("resume-lang", lang);
  } catch (e) {
    /* localStorage unavailable, ignore */
  }
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

document.getElementById("pdf-btn").addEventListener("click", () => {
  window.print();
});

let initialLang = "fr";
try {
  const saved = localStorage.getItem("resume-lang");
  if (saved === "fr" || saved === "en") {
    initialLang = saved;
  }
} catch (e) {
  /* localStorage unavailable, ignore */
}
applyLanguage(initialLang);
