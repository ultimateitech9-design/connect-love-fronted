export type AppLanguage = {
  code: string;
  translationCode: string;
  name: string;
  nativeName: string;
  direction?: "ltr" | "rtl";
};

export const APP_LANGUAGES: AppLanguage[] = [
  { code: "en", translationCode: "en", name: "English", nativeName: "English" },
  { code: "as", translationCode: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "bn", translationCode: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "brx", translationCode: "brx", name: "Bodo", nativeName: "बड़ो" },
  { code: "doi", translationCode: "doi", name: "Dogri", nativeName: "डोगरी" },
  { code: "gu", translationCode: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "hi", translationCode: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "kn", translationCode: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ks", translationCode: "ks", name: "Kashmiri", nativeName: "کٲشُر", direction: "rtl" },
  { code: "gom", translationCode: "gom", name: "Konkani", nativeName: "कोंकणी" },
  { code: "mai", translationCode: "mai", name: "Maithili", nativeName: "मैथिली" },
  { code: "ml", translationCode: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mni-Mtei", translationCode: "mni-Mtei", name: "Manipuri", nativeName: "ꯃꯤꯇꯩ ꯂꯣꯟ" },
  { code: "mr", translationCode: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ne", translationCode: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "or", translationCode: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa", translationCode: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "sa", translationCode: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "sat", translationCode: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sd", translationCode: "sd", name: "Sindhi", nativeName: "سنڌي", direction: "rtl" },
  { code: "ta", translationCode: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", translationCode: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ur", translationCode: "ur", name: "Urdu", nativeName: "اردو", direction: "rtl" },
];

export const DEFAULT_LANGUAGE = APP_LANGUAGES[0];

export function findLanguage(code?: string | null) {
  return APP_LANGUAGES.find((language) => language.code === code) || DEFAULT_LANGUAGE;
}
