import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchPatientsByPro,
  fetchAdminChatHistory,
  fetchAdminBackups,
  updateApiKeys,
  fetchApiUsageStats, 
  fetchUserConversations, 
  downloadChatAudit,
  fetchAllUsers,
  updateUserAdmin,
  fetchAppointmentStats
} from "../../api/admin.api";

interface ApiUsageSummary {
  provider: "STREAM" | "GEMINI";
  _sum: { totalTokens: number };
  _count: { id: number };
}

interface AdminState {
  stats: any | null;
  appointmentStats: any | null,
  users: any[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  } | null;
  auditPatients: any[];
  chatHistory: any[];
  backups: string[];
  apiUsage: ApiUsageSummary[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  auditResults: any[]
  isDownloading?: boolean; // Para manejar el estado de descarga del TXT de auditoría
}

const initialState: AdminState = {
  stats: null,
  appointmentStats: { monthlyVolume: [], statusData: [] },
  users: [],
  pagination: null,
  auditPatients: [],
  chatHistory: [],
  backups: [],
  apiUsage: [],
  loading: false,
  error: null,
  successMessage: null,
  auditResults: [],
  isDownloading: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => { state.error = null; },
    clearAdminMessages: (state) => { state.successMessage = null; },
    resetChatAudit: (state) => {
      state.auditPatients = [];
      state.chatHistory = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // STATS
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // USERS
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      // CHAT AUDIT
      .addCase(fetchPatientsByPro.fulfilled, (state, action) => {
        state.auditPatients = action.payload;
      })
      .addCase(fetchAdminChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.chatHistory = action.payload;
      })
      // BACKUPS
      .addCase(fetchAdminBackups.fulfilled, (state, action) => {
        state.backups = action.payload;
      })
      // API KEYS
      .addCase(updateApiKeys.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(fetchApiUsageStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiUsageStats.fulfilled, (state, action) => {
        state.loading = false;
        state.apiUsage = action.payload;
      })
      .addCase(fetchApiUsageStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.auditResults = action.payload;
      })
      .addCase(fetchUserConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Download Audit (Manejo de loading de descarga)
      .addCase(downloadChatAudit.pending, (state) => {
        state.isDownloading = true;
      })
      .addCase(downloadChatAudit.fulfilled, (state) => {
        state.isDownloading = false;
      })
      .addCase(downloadChatAudit.rejected, (state, action) => {
        state.isDownloading = false;
        state.error = action.payload as string;
      })
      // --- FETCH ALL USERS ---
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- UPDATE USER ---
      .addCase(updateUserAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserAdmin.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Usuario actualizado correctamente";
      })
      .addCase(updateUserAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAppointmentStats.fulfilled, (state, action) => {
        state.appointmentStats = action.payload;
        state.loading = false;
      })
      // Global Loading & Error handling
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => { state.loading = false; }
      )
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => { state.loading = true; }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => { state.loading = false; }
      );
  },
});

export const { clearAdminError, clearAdminMessages, resetChatAudit } = adminSlice.actions;
export default adminSlice.reducer;