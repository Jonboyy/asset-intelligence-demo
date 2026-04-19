import type { FormEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatMessage, ChatResponse } from "@/types/chat"
import { Bot, BrainCircuit, SendHorizonal, User } from "lucide-react"

interface ChatPanelProps {
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  latestResult: ChatResponse | null
  isTraceOpen: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
  onToggleTrace: () => void
}

function formatConfidence(value: number | null | undefined) {
  if (typeof value !== "number") return "Fallback"
  return `${Math.round(value * 100)}%`
}

export function ChatPanel({
  messages,
  input,
  isLoading,
  latestResult,
  isTraceOpen,
  onInputChange,
  onSubmit,
  onToggleTrace,
}: ChatPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  const trace = latestResult?.trace ?? null

  return (
    <Card className="flex h-full min-h-0 flex-col border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Assistant</CardTitle>
            <Button
              type="button"
              variant={isTraceOpen ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleTrace}
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              AI decision trace
            </Button>
          </div>

          <Badge variant="outline">Database-aware routing enabled</Badge>
        </div>

        <p className="text-sm text-slate-500">
          Ask a supported question about asset lifecycle, offboarding risk, data
          quality, or software license utilization.
        </p>
      </CardHeader>

      <CardContent className="relative flex min-h-0 flex-1 flex-col gap-4">
        {isTraceOpen ? (
          <div className="absolute inset-x-6 top-0 z-20 max-h-[50%] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  AI Decision Trace
                </p>
                <p className="text-xs text-slate-500">
                  Demo view of how the assistant routed the latest request.
                </p>
              </div>
              <Badge variant="secondary">{latestResult?.mode ?? "idle"}</Badge>
            </div>

            {trace ? (
              <div className="grid gap-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Intent
                    </p>
                    <p className="mt-1 break-words font-medium text-slate-900">
                      {trace.intent ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Confidence
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatConfidence(trace.confidence)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Selected task
                    </p>
                    <p className="mt-1 break-words font-medium text-slate-900">
                      {trace.selected_task ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Data returned
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {trace.structured_data_returned ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reason
                  </p>
                  <p className="mt-1 whitespace-normal leading-6 text-slate-800 [hyphens:auto]">
                    {trace.reason ?? "No reason available."}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Model / router
                  </p>
                  <p className="mt-1 break-words font-medium text-slate-900">
                    {latestResult?.model ?? trace.model}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                No decision trace yet. Run a demo prompt first, then open this panel
                again.
              </div>
            )}
          </div>
        ) : null}

        <ScrollArea className="min-h-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-4 pr-3">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant"

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      isAssistant
                        ? "border border-slate-200 bg-white text-slate-800"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  {!isAssistant && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Thinking…
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form className="flex items-center gap-3" onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ask about refresh candidates, maintenance, or inventory risk…"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}