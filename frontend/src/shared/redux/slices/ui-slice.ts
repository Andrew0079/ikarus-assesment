import { createSlice } from "@reduxjs/toolkit";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface UiState {
  isGlobalLoading: boolean;
  toasts: ToastMessage[];
}

const initialState: UiState = {
  isGlobalLoading: false,
  toasts: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading: (state, action: { payload: boolean }) => {
      state.isGlobalLoading = action.payload;
    },
    addToast: (state, action: { payload: Omit<ToastMessage, "id"> }) => {
      const toast: ToastMessage = {
        ...action.payload,
        id: crypto.randomUUID(),
        duration: action.payload.duration ?? 5000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: { payload: string }) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { setGlobalLoading, addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;

