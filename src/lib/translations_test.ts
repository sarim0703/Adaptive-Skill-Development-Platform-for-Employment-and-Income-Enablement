export type Language = 'en' | 'hi' | 'kn';
export const translations = {
  en: { "test": "test" },
  hi: { "test": "परीक्षण" },
  kn: { "test": "ಪರೀಕ್ಷೆ" }
};
export type TranslationKey = keyof typeof translations.en;
