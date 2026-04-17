import { AppSidebar } from "@/components/layout/app-sidebar"
import { ChatPanel } from "@/components/assistant/chat-panel"
import { ResultsPanel } from "@/components/results/results-panel"
import type { ChatMessage, ChatResponse } from "@/types/chat"

interface AppShellProps {
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  latestResult: ChatResponse | null
  onInputChange: (value: string) => void
  onSubmit: () => void
  onPromptSelect: (prompt: string) => void
}

export function AppShell({
  messages,
  input,
  isLoading,
  latestResult,
  onInputChange,
  onSubmit,
  onPromptSelect,
}: AppShellProps) {
  return (
    <div className="grid min-h-svh gap-4 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
      <AppSidebar onPromptSelect={onPromptSelect} />
      <ChatPanel
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
      />
      <ResultsPanel result={latestResult} />
    </div>
  )
}