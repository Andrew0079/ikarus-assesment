import { AuthFormActions, AuthFormField } from "../../../shared/components";

export interface LoginFormProps {
  loginId: string;
  password: string;
  loading: boolean;
  error: string | null;
  onLoginIdChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  loginId,
  password,
  loading,
  error,
  onLoginIdChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <AuthFormField
        label="Username or email"
        name="login"
        type="text"
        value={loginId}
        onChange={onLoginIdChange}
        placeholder="Username or email"
        autoComplete="username"
        disabled={loading}
      />
      <AuthFormField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Password"
        autoComplete="current-password"
        disabled={loading}
      />
      <AuthFormActions
        error={error}
        loading={loading}
        submitLabel="Log in"
        linkTo="/register"
        linkLabel="Create an account"
      />
    </form>
  );
}
