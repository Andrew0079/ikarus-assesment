import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, setCredentials } from "../../../shared/redux";
import { ApiClientError } from "../../../shared/api";
import { login as loginService } from "../services/login.service";

export function useLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLoginId(e.target.value);
      setError(null);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPassword(e.target.value);
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmedLogin = loginId.trim();
      if (!trimmedLogin || !password) {
        setError("Please enter username or email and password.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await loginService(trimmedLogin, password);
        if (!result?.user || !result?.access_token) {
          setError("Invalid response from server. Please try again.");
          return;
        }
        dispatch(setCredentials({ user: result.user, token: result.access_token }));
        navigate("/dashboard", { replace: true });
      } catch (err) {
        const message = err instanceof ApiClientError ? err.message : "Login failed. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loginId, password, dispatch, navigate]
  );

  return {
    loginId,
    password,
    loading,
    error,
    handleLoginIdChange,
    handlePasswordChange,
    handleSubmit,
  };
}
