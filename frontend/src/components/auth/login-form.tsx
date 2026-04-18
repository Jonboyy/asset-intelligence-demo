import { useState } from "react"

import { DEMO_USERS } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface LoginFormProps {
  onLogin: (email: string, password: string) => void
  isLoading: boolean
  error: string | null
}

export function LoginForm({
  onLogin,
  isLoading,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState(DEMO_USERS[0].email)
  const [password, setPassword] = useState(DEMO_USERS[0].password)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary">Hiring Demo</Badge>
            <CardTitle className="text-2xl">Asset Intelligence Assistant</CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              An internal analytics assistant for asset lifecycle, maintenance,
              warranty risk, inventory quality, and related operational reporting.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => {
                  setEmail(user.email)
                  setPassword(user.password)
                }}
                className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">{user.title}</p>
                <p className="mt-1 text-sm text-slate-600">{user.name}</p>
                <p className="mt-3 overflow-hidden text-[11px] leading-4 text-slate-500 [overflow-wrap:anywhere]">
                  {user.email}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Use any of the demo accounts above. All demo users currently use the same
            password: <span className="font-semibold text-slate-900">demo123</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              onLogin(email, password)
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="asset.manager@nordaxis.demo"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="demo123"
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Enter workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}