import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, setCredentials } from "../../../shared/redux";
import { ApiClientError } from "../../../shared/api";
import { register as registerService } from "../services/register.service";

export function useRegisterForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUsername(e.target.value);
      setError(null);
    },
    []
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEmail(e.target.value);
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
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();
      if (!trimmedUsername || !trimmedEmail || !password) {
        setError("Please enter username, email and password.");
        return;
      }
      setLoading(true);
      try {
        const result = await registerService(trimmedUsername, trimmedEmail, password);
        dispatch(setCredentials({ user: result.user, token: result.access_token }));
        navigate("/dashboard", { replace: true });
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : "Registration failed. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [username, email, password, dispatch, navigate]
  );

  return {
    username,
    email,
    password,
    loading,
    error,
    handleUsernameChange,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}
