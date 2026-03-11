import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = import.meta.env.VITE_API_URL;

// 1. Initial Search by DNI
export const searchPatientByDni = createAsyncThunk(
  "history/searchPatient",
  async ({ dni, token }: { dni: string; token: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/history/search/${dni}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data.data; // This returns the patient object + history metadata
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 2. Fetch Paginated Entries
export const fetchHistoryEntries = createAsyncThunk(
  "history/fetchEntries",
  async (
    { historyId, token, page, search, date }: { historyId: string; token: string; page: number; search?: string; date?: string },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(search && { search }),
        ...(date && { date }),
      });

      const res = await fetch(`${BASE_URL}/history/${historyId}/entries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data.data; // Returns { entries, total, totalPages }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 3. Add New Entry
export const addHistoryEntry = createAsyncThunk(
  "history/addEntry",
  async (
    { patientId, token, details, diagnostics, date }: { patientId: string; token: string; details: string; diagnostics: string[]; date: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${BASE_URL}/history/${patientId}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ details, diagnostics, date }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAIDiagnostic = createAsyncThunk(
  "history/getAIDiagnostic",
  async ({ details, diagnostics, token }: any, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/analyze`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ details, diagnostics }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return data;
    } catch (err: any) {
      return rejectWithValue("Servicio de IA no disponible");
    }
  }
);