import { createSlice } from "@reduxjs/toolkit";
import { backupChatMessage } from "../../api/chat.api";

interface ChatState {
  isBackingUp: boolean;
  error: string | null;
}

const initialState: ChatState = {
  isBackingUp: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChatError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(backupChatMessage.pending, (state) => {
        state.isBackingUp = true;
      })
      .addCase(backupChatMessage.fulfilled, (state) => {
        state.isBackingUp = false;
        state.error = null;
      })
      .addCase(backupChatMessage.rejected, (state, action) => {
        state.isBackingUp = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearChatError } = chatSlice.actions;
export default chatSlice.reducer;