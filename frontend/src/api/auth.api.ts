import { createAsyncThunk } from "@reduxjs/toolkit";

export interface SignupInput {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface VerifyInput {
  email: string;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}



export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (data: SignupInput, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message);
      }

      return result;
    } catch (error: any) {
      return rejectWithValue("Signup failed");
    }
  }
);

export const verifyAccount = createAsyncThunk(
  "auth/verifyAccount",
  async (data: VerifyInput, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message);
      }

      return result;
    } catch (error) {
      return rejectWithValue("Verification failed");
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message);
      }

      return result;
    } catch {
      return rejectWithValue("Failed to resend OTP");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: LoginInput, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message);
      }

      return result;
    } catch {
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

export const fetchStreamToken = createAsyncThunk(
  "auth/get-token",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const authToken = state.auth.token;

      if (!authToken) {
        return rejectWithValue("No auth token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/stream/get-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data; // { user, token }
    } catch {
      return rejectWithValue("Failed to fetch stream token");
    }
  }
);