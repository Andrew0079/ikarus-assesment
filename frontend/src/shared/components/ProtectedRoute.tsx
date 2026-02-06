import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Renders children only when the user is logged in (has a token).
 * Otherwise redirects to /login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
