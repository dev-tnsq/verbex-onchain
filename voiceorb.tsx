"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type VoiceOrbProps = {
  onTranscript?: (text: string) => void
  size?: number
}

export default function VoiceOrb({ onTranscript, size = 120 }: VoiceOrbProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [level, setLevel] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)

  const orbStyle = useMemo(
    () => ({ width: size, height: size, transform: `scale(${1 + Math.min(level, 0.4) * 0.6})` }),
    [size, level],
  )

  useEffect(() => {
    const SR =
      // @ts-ignore
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setSupported(false)
      return
    }
    const recog = new SR()
    recog.continuous = true
    recog.interimResults = true
    recog.lang = "en-US"
    recog.onresult = (event: any) => {
      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onTranscript?.(transcript.trim())
    }
    recog.onerror = () => stopAll()
    recognitionRef.current = recog
  }, [onTranscript])

  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      const data = new Uint8Array(analyser.frequencyBinCount)
      src.connect(analyser)
      analyserRef.current = analyser

      const loop = () => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 2; i < 16; i++) sum += data[i]
        const avg = sum / 14
        setLevel(avg / 255)
        rafRef.current = requestAnimationFrame(loop)
      }
      loop()
    } catch {
      setSupported(false)
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    analyserRef.current = null
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null
  }, [])

  const stopAll = useCallback(() => {
    stopAudio()
    try {
      recognitionRef.current?.stop?.()
    } catch {}
    setListening(false)
  }, [stopAudio])

  const startAll = useCallback(async () => {
    if (!supported) return
    await startAudio()
    try {
      recognitionRef.current?.start?.()
    } catch {}
    setListening(true)
  }, [startAudio, supported])

  useEffect(() => () => stopAll(), [stopAll])

  if (!supported) return <div className="text-center text-xs opacity-70">Voice not supported in this browser</div>

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => (listening ? stopAll() : startAll())}
        className={`orb ${listening ? "listening" : ""}`}
        style={orbStyle as any}
        aria-pressed={listening}
        aria-label={listening ? "Stop voice capture" : "Start voice capture"}
      />
      <div className={`wave-bars ${listening ? "listening" : ""}`} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} style={{ height: `${6 + (level * 30 * ((i % 5) + 1)) / 5}px` }} />
        ))}
      </div>
      <button
        className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs hover:bg-black/5"
        onClick={() => (listening ? stopAll() : startAll())}
      >
        {listening ? "Stop" : "Start"} Listening
      </button>
    </div>
  )
}
