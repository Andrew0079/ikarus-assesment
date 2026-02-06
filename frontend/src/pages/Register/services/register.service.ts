import { authApi } from "../../../shared/api";
import type { AuthSuccessResponse } from "../../../shared/api";

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthSuccessResponse> {
  return authApi.register({ username, email, password });
}
