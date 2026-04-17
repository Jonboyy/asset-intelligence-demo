import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { LoginForm } from "@/components/auth/login-form"
import { authenticateDemoUser, getStoredSession, setStoredSession } from "@/lib/auth"

export function LoginPage() {
  const navigate = useNavigate()
  const existingSession = getStoredSession()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (existingSession) {
    return <Navigate to="/assistant" replace />
  }

  async function handleLogin(email: string, password: string) {
    setIsLoading(true)
    setError(null)

    try {
      const user = authenticateDemoUser(email, password)

      if (!user) {
        setError("Invalid demo credentials. Choose one of the demo accounts.")
        return
      }

      setStoredSession(user)
      navigate("/assistant", { replace: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-slate-100 px-4 py-8 text-slate-950 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <LoginForm
          onLogin={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </main>
  )
}