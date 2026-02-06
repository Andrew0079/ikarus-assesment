import { Block } from "baseui/block";
import { LoginForm } from "./components/LoginForm";
import { useLoginForm } from "./hooks/use-login-form";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const form = useLoginForm();

  return (
    <div className={styles.split}>
      <div className={styles.left}>
        <div className={styles.formWrap}>
          <Block marginBottom="scale800">
            <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Zonely</h1>
            <Block color="contentSecondary" marginTop="scale200">
              Weather where you are
            </Block>
          </Block>
          <LoginForm
            loginId={form.loginId}
            password={form.password}
            loading={form.loading}
            error={form.error}
            onLoginIdChange={form.handleLoginIdChange}
            onPasswordChange={form.handlePasswordChange}
            onSubmit={form.handleSubmit}
          />
        </div>
      </div>
      <div className={styles.right} role="img" aria-label="Login cover" />
    </div>
  );
}
