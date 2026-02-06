import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BaseWebProvider } from "./providers/BaseWeb";
import { AppProviders } from "./providers/AppProviders";
import { Dashboard } from "./pages/Dashboard";
import Login from "./pages/Login";
import { Register } from "./pages/Register";

function App() {
  return (
    <BaseWebProvider>
      <AppProviders>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        </BrowserRouter>
      </AppProviders>
    </BaseWebProvider>
  );
}

export default App;
