import { Block } from "baseui/block";
import { Button } from "baseui/button";
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
import { Link } from "react-router-dom";

export interface LoginFormProps {
  loginId: string;
  password: string;
  loading: boolean;
  error: string | null;
  onLoginIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
      <Block marginBottom="scale600">
        <FormControl label="Username or email">
          <Input
            name="login"
            value={loginId}
            onChange={onLoginIdChange}
            placeholder="Username or email"
            type="text"
            autoComplete="username"
            disabled={loading}
          />
        </FormControl>
      </Block>
      <Block marginBottom="scale600">
        <FormControl label="Password">
          <Input
            name="password"
            value={password}
            onChange={onPasswordChange}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            disabled={loading}
          />
        </FormControl>
      </Block>
      {error ? (
        <Block marginBottom="scale600" color="red600">
          {error}
        </Block>
      ) : null}
      <Block display="flex" flexDirection="column" alignItems="flex-start" style={{ gap: "1rem" }}>
        <Button type="submit" isLoading={loading} disabled={loading}>
          Log in
        </Button>
        <Link to="/register">Create an account</Link>
      </Block>
    </form>
  );
}
