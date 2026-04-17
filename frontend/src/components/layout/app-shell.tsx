import { AppSidebar } from "@/components/layout/app-sidebar"
import { ChatPanel } from "@/components/assistant/chat-panel"
import { ResultsPanel } from "@/components/results/results-panel"
import type { DemoUserRole } from "@/types/auth"
import type { ChatMessage, ChatResponse } from "@/types/chat"

interface AppShellProps {
  userName: string
  userTitle: string
  userRole: DemoUserRole
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  latestResult: ChatResponse | null
  onInputChange: (value: string) => void
  onSubmit: () => void
  onPromptSelect: (prompt: string) => void
  onLogout: () => void
}

export function AppShell({
  userName,
  userTitle,
  userRole,
  messages,
  input,
  isLoading,
  latestResult,
  onInputChange,
  onSubmit,
  onPromptSelect,
  onLogout,
}: AppShellProps) {
  return (
    <div className="grid min-h-svh gap-4 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
      <AppSidebar
        userName={userName}
        userTitle={userTitle}
        userRole={userRole}
        onPromptSelect={onPromptSelect}
        onLogout={onLogout}
      />
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