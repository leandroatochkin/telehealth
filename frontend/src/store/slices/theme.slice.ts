// store/slices/theme.slice.ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  colors: {
    primary: "#02C39A",
    accent: "#00A896",
    background: "#F8F9FA",
    secondary: "#05668D",
    success: "#2ECC71",
    warning: "#F4A261",
    danger: "#E63946",
    textPrimary: "#1F2933",
    textSecondary: "#52606D",
    border: "#E5E7EB",
    surface: "#FFFFFF",
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 8px rgba(0,0,0,0.08)",
    lg: "0 10px 25px rgba(0,0,0,0.12)",
    soft: "0 8px 30px rgba(2,195,154,0.15)",
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setPrimaryColor: (state, action) => {
      state.colors.primary = action.payload;
    },
    setAccentColor: (state, action) => {
      state.colors.accent = action.payload;
    },
  },
});

export const { setPrimaryColor, setAccentColor } = themeSlice.actions;
export default themeSlice.reducer;