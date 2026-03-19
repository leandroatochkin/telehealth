import { createAsyncThunk } from "@reduxjs/toolkit";

interface BackupPayload {
  channelId: string;
  text: string;
  streamMessageId: string;
  token: string;
}

export const backupChatMessage = createAsyncThunk(
  "chat/backupMessage",
  async ({ channelId, text, streamMessageId, token }: BackupPayload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/backup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ channelId, text, streamMessageId }),
      });

      const data = await res.json();

      if (!res.ok) return rejectWithValue(data.message);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);