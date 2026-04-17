import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, Database, LayoutDashboard, ShieldCheck } from "lucide-react"

interface AppSidebarProps {
  onPromptSelect: (prompt: string) => void
}

const demoPrompts = [
  "Which laptops are likely due for refresh soon?",
  "Show refresh candidates due within the next 180 days.",
  "Which laptops need replacement in the next 6 months?",
  "List laptop refresh candidates by office.",
]

export function AppSidebar({ onPromptSelect }: AppSidebarProps) {
  return (
    <Card className="h-full border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Asset Intelligence Assistant</CardTitle>
            <p className="text-sm text-slate-500">NordAxis Mobility Group</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Demo User</Badge>
          <Badge variant="outline">Asset Manager</Badge>
        </div>
      </CardHeader>

      <CardContent className="h-[calc(100%-6.5rem)] p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Workspace
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
                  <LayoutDashboard className="h-4 w-4" />
                  Assistant
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500">
                  <Database className="h-4 w-4" />
                  Analytics
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500">
                  <ShieldCheck className="h-4 w-4" />
                  Access & Audit
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Suggested prompts
              </p>

              <div className="space-y-2">
                {demoPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-start whitespace-normal rounded-xl px-3 py-3 text-left text-sm leading-5"
                    onClick={() => onPromptSelect(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scope
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                This assistant is limited to asset lifecycle, assignments, maintenance,
                warranties, license utilization, and related analytics.
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}