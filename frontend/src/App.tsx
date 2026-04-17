import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "@/components/layout/protected-route"
import { getStoredSession } from "@/lib/auth"
import { AssistantPage } from "@/pages/assistant-page"
import { LoginPage } from "@/pages/login-page"

function AppRoutes() {
  const hasSession = Boolean(getStoredSession())

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/assistant" element={<AssistantPage />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={hasSession ? "/assistant" : "/login"} replace />
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}