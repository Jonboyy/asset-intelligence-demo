import { ChatPanel } from "@/components/assistant/chat-panel"
import { AppSidebar } from "@/components/layout/app-sidebar"
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
  isTraceOpen: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
  onPromptSelect: (prompt: string) => void
  onLogout: () => void
  onToggleTrace: () => void
}

export function AppShell({
  userName,
  userTitle,
  userRole,
  messages,
  input,
  isLoading,
  latestResult,
  isTraceOpen,
  onInputChange,
  onSubmit,
  onPromptSelect,
  onLogout,
  onToggleTrace,
}: AppShellProps) {
  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_500px]">
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
        latestResult={latestResult}
        isTraceOpen={isTraceOpen}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onToggleTrace={onToggleTrace}
      />
      <ResultsPanel result={latestResult} />
    </div>
  )
}