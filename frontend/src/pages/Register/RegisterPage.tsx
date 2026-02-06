import { AuthLayout } from "../../shared/components";
import { RegisterForm } from "./components/RegisterForm";
import { useRegisterForm } from "./hooks/use-register-form";

export function RegisterPage() {
  const form = useRegisterForm();

  return (
    <AuthLayout rightAriaLabel="Sign up cover">
      <RegisterForm
        username={form.username}
        email={form.email}
        password={form.password}
        loading={form.loading}
        error={form.error}
        onUsernameChange={form.handleUsernameChange}
        onEmailChange={form.handleEmailChange}
        onPasswordChange={form.handlePasswordChange}
        onSubmit={form.handleSubmit}
      />
    </AuthLayout>
  );
}
