import { Navigate, Outlet } from "react-router-dom"

import { getStoredSession } from "@/lib/auth"

export function ProtectedRoute() {
  const session = getStoredSession()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}