import type { ChatResponse } from "@/types/chat"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

interface SendChatMessageParams {
  message: string
  role?: string
}

export async function sendChatMessage({
  message,
  role = "asset_manager",
}: SendChatMessageParams): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      role,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || "Chat request failed.")
  }

  return response.json()
}