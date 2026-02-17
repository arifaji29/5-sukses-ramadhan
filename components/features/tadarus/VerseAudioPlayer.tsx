'use client'

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Loader2 } from "lucide-react"

export default function VerseAudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Reset state jika audioUrl berubah
    setIsPlaying(false)
    setIsLoading(false)
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true) // Set loading saat mulai buffer
      audioRef.current.play()
        .then(() => {
           setIsLoading(false)
           setIsPlaying(true)
        })
        .catch(() => {
           setIsLoading(false)
           setIsPlaying(false)
        })
    }
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        preload="none"
      />
      <button 
        onClick={togglePlay}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 shadow-sm"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" className="ml-0.5" />
        )}
      </button>
    </>
  )
}