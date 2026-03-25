import { createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPatientsByPro = createAsyncThunk(
  "admin/fetchPatientsByPro",
  async ({ proId, token }: { proId: string; token: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/admin/pro-patients/${proId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAdminChatHistory = createAsyncThunk(
  "admin/fetchChatHistory",
  async ({ proId, patId, token }: { proId: string; patId: string; token: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/admin/chat-history?professionalId=${proId}&patientId=${patId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAdminBackups = createAsyncThunk(
  "admin/fetchBackups",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/admin/backups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateApiKeys = createAsyncThunk(
  "admin/updateKeys",
  async ({ type, payload, token }: { type: 'stream' | 'gemini', payload: any, token: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/admin/settings/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { type, message: data.message };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchApiUsageStats = createAsyncThunk(
  "admin/fetchApiUsageStats",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/api-usage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al obtener estadísticas de uso");

      return data.data; // Retorna el array de { provider, _sum: { totalTokens }, _count: { id } }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const triggerManualBackup = createAsyncThunk(
  "admin/createBackup",
  async (token: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/backups/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Refrescamos la lista automáticamente después de crear uno nuevo
      dispatch(fetchAdminBackups(token)); 
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUserConversations = createAsyncThunk(
  "admin/fetchUserConversations",
  async ({ userId, token }: { userId: string; token: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/audit/list/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al buscar chats");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadChatAudit = createAsyncThunk(
  "admin/downloadChatAudit",
  async ({ channelId, token }: { channelId: string; token: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/audit/export/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo generar el archivo de auditoría");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AUDIT_${channelId}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      return channelId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// api/admin.api.ts
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async ({ token, page = 1, search = "" }: { token: string; page?: number; search?: string }) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/users?page=${page}&search=${search}`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.data; // { users: [], pagination: {} }
  }
);

export const updateUserAdmin = createAsyncThunk(
  "admin/updateUser",
  async ({ id, userData, token }: { id: string; userData: any; token: string }, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al actualizar usuario");

      // Opcional: Refrescar la lista actual con los filtros que ya tenía
      // dispatch(fetchAllUsers({ token, page: 1 })); 
      
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAppointmentStats = createAsyncThunk(
  "admin/fetchAppointmentStats",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);