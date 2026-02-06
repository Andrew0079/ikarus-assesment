import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { Register } from "./pages/Register";
import { AppProviders } from "./providers/AppProviders";
import { BaseWebProvider } from "./providers/BaseWeb";
import { ErrorBoundary, ProtectedRoute, Toaster } from "./shared/components";

function App() {
  return (
    <ErrorBoundary>
      <BaseWebProvider>
        <AppProviders>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AppProviders>
      </BaseWebProvider>
    </ErrorBoundary>
  );
}

export default App;
