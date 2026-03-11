import { createSlice } from "@reduxjs/toolkit";
import { searchPatientByDni, fetchHistoryEntries, addHistoryEntry, getAIDiagnostic } from "../../api/history.api";

interface HistoryState {
  patient: any | null;
  entries: any[];
  totalEntries: number;
  loading: boolean;
  entriesLoading: boolean;
  error: string | null;
  aiLoading: boolean; // For the "Get AI Diagnostic" button
}

const initialState: HistoryState = {
  patient: null,
  entries: [],
  totalEntries: 0,
  loading: false,
  entriesLoading: false,
  error: null,
  aiLoading: false,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearHistoryState: (state) => {
      state.patient = null;
      state.entries = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // SEARCH PATIENT
      .addCase(searchPatientByDni.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatientByDni.fulfilled, (state, action) => {
        state.loading = false;
        state.patient = action.payload;
      })
      .addCase(searchPatientByDni.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH ENTRIES (PAGINATED)
      .addCase(fetchHistoryEntries.pending, (state) => {
        state.entriesLoading = true;
      })
      .addCase(fetchHistoryEntries.fulfilled, (state, action) => {
        state.entriesLoading = false;
        state.entries = action.payload.entries;
        state.totalEntries = action.payload.total;
      })
      .addCase(fetchHistoryEntries.rejected, (state) => {
        state.entriesLoading = false;
      })

      // ADD ENTRY
      .addCase(addHistoryEntry.fulfilled, (state, action) => {
        // Optimistically add to the top of the list if on page 1
        state.entries.unshift(action.payload);
        state.totalEntries += 1;
      })
      
      .addCase(getAIDiagnostic.pending, (state) => {
        state.aiLoading = true; // Use a specific loader for the AI button
      })
      .addCase(getAIDiagnostic.fulfilled, (state) => {
        state.aiLoading = false;
        // We DON'T update state.entries here because the AI response 
        // is handled by the component's local setDetails/setDiagnostics
      })
      .addCase(getAIDiagnostic.rejected, (state) => {
        state.aiLoading = false;
      });
   
  },
});

export const { clearHistoryState } = historySlice.actions;
export default historySlice.reducer;