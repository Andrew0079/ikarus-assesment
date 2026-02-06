import { AuthFormActions, AuthFormField } from "../../../shared/components";

export interface RegisterFormProps {
  username: string;
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RegisterForm({
  username,
  email,
  password,
  loading,
  error,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <AuthFormField
        label="Username"
        name="username"
        type="text"
        value={username}
        onChange={onUsernameChange}
        placeholder="Username"
        autoComplete="username"
        disabled={loading}
      />
      <AuthFormField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="Email"
        autoComplete="email"
        disabled={loading}
      />
      <AuthFormField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Password"
        autoComplete="new-password"
        disabled={loading}
      />
      <AuthFormActions
        error={error}
        loading={loading}
        submitLabel="Create account"
        linkTo="/login"
        linkLabel="Already have an account? Log in"
      />
    </form>
  );
}
