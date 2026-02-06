import { apiClient } from "../client";
import type {
  User,
  AuthLoginBody,
  AuthRegisterBody,
  AuthSuccessResponse,
  ApiError,
} from "../types";

export const authApi = {
  login: async (body: AuthLoginBody): Promise<AuthSuccessResponse> => {
    const { data } = await apiClient.post<AuthSuccessResponse>("/api/auth/login", body);
    return data;
  },

  register: async (body: AuthRegisterBody): Promise<AuthSuccessResponse> => {
    const { data } = await apiClient.post<AuthSuccessResponse>("/api/auth/register", body);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/api/auth/me");
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout", {});
  },
};

export type AuthApiError = ApiError;
