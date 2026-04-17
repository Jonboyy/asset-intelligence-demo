import { useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { sendChatMessage } from "@/lib/api"
import type { ChatMessage, ChatResponse } from "@/types/chat"

const initialAssistantMessage =
  "Hello — I can help with asset lifecycle, refresh candidates, maintenance, and related analytics. The strongest demo path right now is laptop refresh analysis."

function createMessage(role: "user" | "assistant", content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  }
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", initialAssistantMessage),
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [latestResult, setLatestResult] = useState<ChatResponse | null>(null)

  async function handleSendMessage(messageOverride?: string) {
    const nextMessage = (messageOverride ?? input).trim()
    if (!nextMessage || isLoading) return

    const userMessage = createMessage("user", nextMessage)

    setMessages((current) => [...current, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await sendChatMessage({
        message: nextMessage,
        role: "asset_manager",
      })

      setLatestResult(response)
      setMessages((current) => [
        ...current,
        createMessage("assistant", response.reply),
      ])
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong."

      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          `The request failed.\n\n${errorMessage}`
        ),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-slate-100 px-4 py-4 text-slate-950 md:px-6 md:py-6">
      <div className="mx-auto max-w-[1600px]">
        <AppShell
          messages={messages}
          input={input}
          isLoading={isLoading}
          latestResult={latestResult}
          onInputChange={setInput}
          onSubmit={() => void handleSendMessage()}
          onPromptSelect={(prompt) => void handleSendMessage(prompt)}
        />
      </div>
    </main>
  )
}