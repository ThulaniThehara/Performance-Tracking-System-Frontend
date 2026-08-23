import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import si from "./locales/si.json";
import ta from "./locales/ta.json";

// The three languages the app ships with. `nativeName` is what we show in the
// language dropdown so a Sinhala/Tamil reader can find their own language even
// while the UI is still in English.
export const SUPPORTED_LANGUAGES = [
  { code: "en", nativeName: "English" },
  { code: "si", nativeName: "සිංහල" },
  { code: "ta", nativeName: "தமிழ்" },
];

export const LANGUAGE_STORAGE_KEY = "appLanguage";

// Read any previously saved language from localStorage, defaulting to 'en'
const savedLanguage = typeof window !== "undefined" ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    lng: savedLanguage || "en",
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

// Keep <html lang="..."> in sync so screen readers and the browser pick the
// right font/hyphenation rules for Sinhala and Tamil.
const applyDocumentLanguage = (lng) => {
  document.documentElement.setAttribute("lang", lng || "en");
};

applyDocumentLanguage(i18n.resolvedLanguage);
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
