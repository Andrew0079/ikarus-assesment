import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BaseWebProvider } from "./providers/BaseWeb";
import { AppProviders } from "./providers/AppProviders";
import { ProtectedRoute, Toaster } from "./shared/components";
import { Dashboard } from "./pages/Dashboard";
import Login from "./pages/Login";
import { Register } from "./pages/Register";

function App() {
  return (
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
  );
}

export default App;
