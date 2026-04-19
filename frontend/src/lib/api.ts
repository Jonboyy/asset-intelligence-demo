import type { ChatResponse } from "@/types/chat"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

const REQUEST_TIMEOUT_MS = 45_000

interface SendChatMessageParams {
  message: string
  role?: string
}

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function extractFastApiErrorMessage(errorBody: string) {
  try {
    const parsed = JSON.parse(errorBody) as { detail?: unknown }

    if (typeof parsed.detail === "string") {
      return parsed.detail
    }

    if (Array.isArray(parsed.detail)) {
      return "The request format was invalid. Please check your input and try again."
    }

    return "The server returned an unexpected error."
  } catch {
    return errorBody || "The server returned an unexpected error."
  }
}

export async function sendChatMessage({
  message,
  role = "asset_manager",
}: SendChatMessageParams): Promise<ChatResponse> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        role,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      const message = extractFastApiErrorMessage(errorBody)

      throw new ApiError(message, response.status)
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The request timed out. The backend or AI provider may be slow. Please try again.",
      )
    }

    throw new ApiError(
      "Could not reach the backend. Make sure the API server is running.",
    )
  } finally {
    window.clearTimeout(timeoutId)
  }
}