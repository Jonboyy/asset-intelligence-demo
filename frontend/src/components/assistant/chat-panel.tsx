import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { ChatMessage } from "@/types/chat"
import { Bot, SendHorizonal, User } from "lucide-react"

interface ChatPanelProps {
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
}

export function ChatPanel({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Card className="flex h-full min-h-0 flex-col border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">Assistant</CardTitle>
          <Badge variant="outline">Database-aware routing enabled</Badge>
        </div>
        <p className="text-sm text-slate-500">
          Ask a supported question. Right now the strongest path is laptop refresh
          analysis.
        </p>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
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
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
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