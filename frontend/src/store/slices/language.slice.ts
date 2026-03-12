// import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// import { translations, type LanguageType } from "../../data/lang";

// interface LanguageState {
//   currentLang: LanguageType;
//   dictionary: typeof translations['es'];
// }

// // Leemos la variable de entorno, por defecto 'es'
// const preferredLang = (import.meta.env.VITE_PREFERRED_LANG as LanguageType) || "es";

// const initialState: LanguageState = {
//   currentLang: preferredLang,
//   dictionary: translations[preferredLang] || translations.es,
// };

// const languageSlice = createSlice({
//   name: "language",
//   initialState,
//   reducers: {
//     setLanguage: (state, action: PayloadAction<LanguageType>) => {
//       state.currentLang = action.payload;
//       state.dictionary = translations[action.payload];
//     },
//   },
// });

// export const { setLanguage } = languageSlice.actions;
// export default languageSlice.reducer;