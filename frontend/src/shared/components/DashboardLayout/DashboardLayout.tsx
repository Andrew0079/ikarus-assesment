import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch, clearCredentials } from "../../redux";
import { authApi } from "../../api";
import { Button } from "baseui/button";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors (e.g. network); still clear local state
    }
    dispatch(clearCredentials());
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className={styles.header}>
        <span className={styles.brand}>Zonely</span>
        <div className={styles.userRow}>
          <span style={{ fontSize: "14px", opacity: 0.9 }}>
            {user?.username ?? user?.email ?? "User"}
          </span>
          <Button
            size="compact"
            kind="tertiary"
            onClick={handleLogout}
            overrides={{
              BaseButton: {
                style: { color: "rgba(255,255,255,0.9)", ":hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.1)" } },
              },
            }}
          >
            Log out
          </Button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </>
  );
}
