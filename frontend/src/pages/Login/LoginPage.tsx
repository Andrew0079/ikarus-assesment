import { AuthLayout } from "../../shared/components";
import { LoginForm } from "./components/LoginForm";
import { useLoginForm } from "./hooks/use-login-form";

export function LoginPage() {
  const form = useLoginForm();

  return (
    <AuthLayout rightAriaLabel="Login cover">
      <LoginForm
        loginId={form.loginId}
        password={form.password}
        loading={form.loading}
        error={form.error}
        onLoginIdChange={form.handleLoginIdChange}
        onPasswordChange={form.handlePasswordChange}
        onSubmit={form.handleSubmit}
      />
    </AuthLayout>
  );
}
