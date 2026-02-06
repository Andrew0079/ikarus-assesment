import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../api";

const AUTH_TOKEN_KEY = "weather_app_token";

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const storedToken = getStoredToken();

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: { payload: { user: User; token: string } }) => {
      const { user, token } = action.payload;
      console.log("[Auth Slice] setCredentials called", {
        user,
        token: token.substring(0, 20) + "...",
      });
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      setStoredToken(token);
    },
    clearCredentials: (state) => {
      console.log("[Auth Slice] clearCredentials called - STACK TRACE:", new Error().stack);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setStoredToken(null);
    },
    setUser: (state, action: { payload: User }) => {
      state.user = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setUser } = authSlice.actions;
export default authSlice.reducer;
