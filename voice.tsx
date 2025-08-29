"use client"

import VoiceOrb from "./voiceorb"

export default function VoicePage() {
  return (
    <div className="relative">
      {/* background floaters */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-10 top-20 h-56 w-56 rounded-full bg-[var(--brand-lime)]/30 blur-2xl animate-pulse" />
        <div className="absolute right-10 bottom-20 h-64 w-64 rounded-full bg-[var(--brand-blue)]/25 blur-2xl animate-pulse" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-6xl flex-col items-center justify-center gap-6 px-4 py-10">
        <div className="flex items-center gap-2">
          <div className="funky-sticky text-xs">Voice Mode</div>
          <div className="funky-ribbon text-[10px]">Hands‑free</div>
        </div>

        <div className="brand-card grid place-items-center p-10">
          {/* no transcript, no text fields; orb handles start/stop */}
          <VoiceOrb size={220} />
        </div>

        <div className="text-center text-xs opacity-70">Tap the orb to start or stop listening.</div>

        <a
          href="/chat"
          className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-plum)] px-4 py-2 text-xs text-white"
        >
          Back to Chat
        </a>
      </div>
    </div>
  )
}
