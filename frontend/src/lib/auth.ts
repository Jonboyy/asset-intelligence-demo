import type { DemoUser } from "@/types/auth"

const STORAGE_KEY = "asset-intelligence-demo-session"

export const DEMO_USERS: DemoUser[] = [
  {
    name: "Luca Horvath",
    email: "asset.manager@nordaxis.demo",
    password: "demo123",
    role: "asset_manager",
    title: "Asset Manager",
  },
  {
    name: "Anna Kovacs",
    email: "it.manager@nordaxis.demo",
    password: "demo123",
    role: "it_manager",
    title: "IT Operations Manager",
  },
  {
    name: "Marek Novak",
    email: "operations.manager@nordaxis.demo",
    password: "demo123",
    role: "operations_manager",
    title: "Operations Manager",
  },
]

export function authenticateDemoUser(
  email: string,
  password: string,
): DemoUser | null {
  const normalizedEmail = email.trim().toLowerCase()

  const user = DEMO_USERS.find(
    (item) =>
      item.email.toLowerCase() === normalizedEmail && item.password === password,
  )

  return user ?? null
}

export function setStoredSession(user: DemoUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function getStoredSession(): DemoUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as DemoUser
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY)
}