"use client"

import { useState } from "react"
import { ChatBubble } from "./chat_bubble"

type Msg = { role: "user" | "assistant" | "system"; content: string }

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m Verbex. Tell me your DeFi intent: “Swap 100 USDC to ETH with best route, then lend 50% to Aave.”",
    },
  ])

  const send = (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return
    setMessages((m) => [...m, { role: "user", content }, { role: "assistant", content: demoReply(content) }])
    setInput("")
  }

  function demoReply(userText: string) {
    return `Got it. I’ll simulate: ${userText}. Then choose the best route, estimate gas, and execute gaslessly on confirmation.`
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-rows-[auto_1fr_auto] gap-4 px-4 py-6 md:grid-cols-[280px_1fr] md:grid-rows-[auto_1fr]">
      {/* Sidebar */}
      <aside className="brand-card hidden flex-col gap-3 p-4 md:flex">
        <div className="flex items-center justify-between">
          <div className="funky-sticky text-xs">Sessions</div>
          <button className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs hover:bg-black/5">New</button>
        </div>
        <div className="text-xs opacity-70">Demo stores messages in memory.</div>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="rounded-md bg-black/5 px-2 py-1">Quick Start</li>
          <li className="rounded-md px-2 py-1 hover:bg-black/5">Yield Scan</li>
          <li className="rounded-md px-2 py-1 hover:bg-black/5">Lend & Hedge</li>
        </ul>
      </aside>

      {/* Chat */}
      <section className="brand-card flex min-h-[60vh] flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="funky-ribbon text-xs">Verbex Assistant</span>
            <span className="funky-sticky text-[10px]">Gasless</span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="/voice"
              className="rounded-md bg-[var(--brand-lime)] px-3 py-1 text-xs text-[var(--brand-plum)] shadow-[0_6px_18px_rgba(200,255,69,0.35)] hover:brightness-95"
            >
              Voice Mode
            </a>
            <button className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs hover:bg-black/5">
              Settings
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
          {messages.map((m, i) => (
            <ChatBubble role={m.role} key={i}>
              {m.content}
            </ChatBubble>
          ))}
        </div>

        <footer className="border-t border-black/5 px-3 py-3">
          {/* text-only input bar */}
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <div className="brand-card flex items-center gap-2 rounded-xl px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder='Tell Verbex what to do: "Swap 100 USDC to ETH, then lend half to Aave"'
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
              />
            </div>

            <button
              onClick={() => send()}
              className="h-10 rounded-xl bg-[var(--brand-plum)] px-4 text-sm text-white hover:opacity-95"
              aria-label="Send message"
            >
              Send
            </button>
          </div>

          {/* mobile Voice shortcut under bar */}
          <div className="mt-2 flex items-center justify-center md:hidden">
            <a
              href="/voice"
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-lime)] px-4 py-2 text-[11px] text-[var(--brand-plum)]"
            >
              Voice Mode
            </a>
          </div>
        </footer>
      </section>
    </div>
  )
}
