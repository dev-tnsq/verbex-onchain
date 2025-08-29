import type React from "react"
import { cn } from "@/lib/utils"

export function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant" | "system"
  children: React.ReactNode
}) {
  const isUser = role === "user"
  const base = "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(base, isUser ? "msg-user" : "msg-bot")}>{children}</div>
    </div>
  )
}
