import { createAsyncThunk } from "@reduxjs/toolkit";

export const createPrescription = createAsyncThunk(
  "prescriptions/create",
  async ({ data, token }: { data: any; token: string }, { rejectWithValue }) => {
    try {
      // DEBUG: Log this to your browser console to see what is being sent
      console.log("Thunk sending data:", data);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/prescriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Crucial
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(data), // If 'data' is undefined, this fails
        }
      );

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result.message);
      return result;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create prescription");
    }
  }
);

export const fetchPatientPrescriptions = createAsyncThunk(
  "prescriptions/patient",
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/prescriptions/patient`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message);
      }

      return result;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch prescriptions");
    }
  }
);

export const fetchDoctorPrescriptions = createAsyncThunk(
  "prescriptions/doctor",
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/prescriptions/doctor`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message);
      }

      return result;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch prescriptions");
    }
  }
);

export const identifyPatient = createAsyncThunk(

  "history/identifyPatient",
  async ({ dni, token }: { dni: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/patient`, {
        method: "POST", // POST instead of GET for security
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ dni }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return data;
    } catch (err) {
      return rejectWithValue("Error de conexión");
    }
  }
);