import { createSlice } from "@reduxjs/toolkit";
import { signupUser, verifyAccount, resendOtp, loginUser, fetchStreamToken } from "../../api/auth.api";

interface AuthState {
  loading: boolean;
  error: string | null;
  pendingEmail: string | null;
  verified: boolean;
  resendLoading: boolean;
  token?: string | null;
  user: any | null;
  streamToken: string | null;
  streamUser: any | null;
  streamLoading: boolean;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  pendingEmail: null,
  verified: false,
  resendLoading: false,
  token: localStorage.getItem("authToken"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  streamToken: localStorage.getItem("streamToken"),
  streamUser: null,
  streamLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.streamToken = null;
      state.streamUser = null;

      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("streamToken");
    }
  },
  extraReducers: (builder) => {
  builder
    // SIGNUP
    .addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(signupUser.fulfilled, (state, action) => {
      state.loading = false;
      state.pendingEmail = action.meta.arg.email;
    })
    .addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // VERIFY
    .addCase(verifyAccount.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(verifyAccount.fulfilled, (state) => {
      state.loading = false;
      state.verified = true;
      state.pendingEmail = null;
    })
    .addCase(verifyAccount.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // RESEND OTP
    .addCase(resendOtp.pending, (state) => {
    state.resendLoading = true;
    })
    .addCase(resendOtp.fulfilled, (state) => {
    state.resendLoading = false;
    })
    .addCase(resendOtp.rejected, (state) => {
    state.resendLoading = false;
    })
    .addCase(loginUser.pending, (state) => {
  state.loading = true;
  state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
    state.loading = false;

    const { token, user, streamToken } = action.payload;

    state.token = token;
    state.user = user;
    state.streamToken = streamToken;

    // Persist
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("streamToken", streamToken);
    })
    .addCase(loginUser.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload as string;
    })
    .addCase(fetchStreamToken.pending, (state) => {
      state.streamLoading = true;
    })
    .addCase(fetchStreamToken.fulfilled, (state, action) => {
      state.streamLoading = false;
      state.streamUser = action.payload.user;
      state.streamToken = action.payload.token;
    })
    .addCase(fetchStreamToken.rejected, (state) => {
      state.streamLoading = false;
    });
    }
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;