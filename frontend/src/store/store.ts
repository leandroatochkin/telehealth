import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import themeReducer from "./slices/theme.slice";
import appointmentsReducer from "./slices/appointments.slice";
import professionalReducer from "./slices/professional.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    appointments: appointmentsReducer,
    professional: professionalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;