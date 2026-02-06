import { Block } from "baseui/block";
import { Button } from "baseui/button";
import { Link } from "react-router-dom";

export interface AuthFormActionsProps {
  error: string | null;
  loading: boolean;
  submitLabel: string;
  linkTo: string;
  linkLabel: string;
}

export function AuthFormActions({
  error,
  loading,
  submitLabel,
  linkTo,
  linkLabel,
}: AuthFormActionsProps) {
  return (
    <>
      {error ? (
        <Block marginBottom="scale600" color="red600">
          {error}
        </Block>
      ) : null}
      <Block display="flex" flexDirection="column" alignItems="flex-start" style={{ gap: "1rem" }}>
        <Button
          type="submit"
          isLoading={loading}
          disabled={loading}
          overrides={{
            BaseButton: {
              style: {
                backgroundColor: "#0ea5e9",
                ":hover": { backgroundColor: "#0284c7" },
                ":disabled": { backgroundColor: "#94a3b8" },
              },
            },
          }}
        >
          {submitLabel}
        </Button>
        <Link to={linkTo}>{linkLabel}</Link>
      </Block>
    </>
  );
}
