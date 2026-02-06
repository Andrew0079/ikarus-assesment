import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../api";

const AUTH_TOKEN_KEY = "weather_app_token";
const AUTH_USER_KEY = "weather_app_user";

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

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as User;
    return data && typeof data.id === "number" && data.username ? data : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_USER_KEY);
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
const storedUser = getStoredToken() ? getStoredUser() : null;

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: { payload: { user: User; token: string } }) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      setStoredToken(token);
      setStoredUser(user);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setStoredToken(null);
      setStoredUser(null);
    },
    setUser: (state, action: { payload: User }) => {
      state.user = action.payload;
      setStoredUser(action.payload);
    },
  },
});

export const { setCredentials, clearCredentials, setUser } = authSlice.actions;
export default authSlice.reducer;
