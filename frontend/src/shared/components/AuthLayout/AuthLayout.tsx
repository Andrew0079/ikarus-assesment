import { Block } from "baseui/block";
import styles from "./AuthLayout.module.css";

const SUBTITLE = "Weather where you are";

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Accessible label for the right-side cover image */
  rightAriaLabel?: string;
}

export function AuthLayout({ children, rightAriaLabel = "Auth cover" }: AuthLayoutProps) {
  return (
    <div className={styles.split}>
      <div className={styles.left}>
        <div className={styles.formWrap}>
          <Block marginBottom="scale800">
            <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Zonely</h1>
            <Block color="contentSecondary" marginTop="scale200">
              {SUBTITLE}
            </Block>
          </Block>
          {children}
        </div>
      </div>
      <div className={styles.right} role="img" aria-label={rightAriaLabel} />
    </div>
  );
}
