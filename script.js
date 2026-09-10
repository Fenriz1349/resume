// Switches every [data-i18n] element to the given language and remembers the choice.
// `translations` comes from i18n.js, loaded before this script.
function applyLanguage(language) {
  const dictionary = translations[language];
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translationKey = element.getAttribute("data-i18n");
    if (dictionary[translationKey]) {
      element.textContent = dictionary[translationKey];
    }
  });
  document.documentElement.lang = language;

  // Highlight the active FR/EN button.
  document.querySelectorAll(".lang-btn").forEach((languageButton) => {
    languageButton.classList.toggle("is-active", languageButton.dataset.lang === language);
  });

  try {
    localStorage.setItem("resume-lang", language);
  } catch (error) {
    // localStorage can be unavailable (private browsing, disabled storage) - ignore.
  }
}

// Language toggle buttons in the toolbar.
document.querySelectorAll(".lang-btn").forEach((languageButton) => {
  languageButton.addEventListener("click", () => applyLanguage(languageButton.dataset.lang));
});

// "Download PDF" generates and downloads a real, text-based PDF directly (see pdf.js) -
// no browser print dialog, so no OS/browser print header and identical behavior on
// Windows and Mac.
document.getElementById("pdf-btn").addEventListener("click", () => {
  generateResumePdf();
});

// On load, restore the last chosen language if we have one, otherwise default to French.
let initialLanguage = "fr";
try {
  const savedLanguage = localStorage.getItem("resume-lang");
  if (savedLanguage === "fr" || savedLanguage === "en") {
    initialLanguage = savedLanguage;
  }
} catch (error) {
  // localStorage can be unavailable (private browsing, disabled storage) - ignore.
}
applyLanguage(initialLanguage);
