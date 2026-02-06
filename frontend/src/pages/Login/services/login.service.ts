import { authApi } from "../../../shared/api";
import type { AuthSuccessResponse } from "../../../shared/api";

export async function login(loginId: string, password: string): Promise<AuthSuccessResponse> {
  return authApi.login({ login: loginId, password });
}
