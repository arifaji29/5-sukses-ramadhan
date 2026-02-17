'use client'

import { Timer, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { getLailatulQadarStartDate } from "@/lib/ramadhan-time"

export default function LailatulQadarCountdown() {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)

  useEffect(() => {
    const targetDate = getLailatulQadarStartDate().getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        setTimeLeft(null)
        clearInterval(timer)
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!timeLeft) return null 

  return (
    <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-6 text-center text-white backdrop-blur-sm shadow-xl animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-3">
            <div className="bg-indigo-500/20 p-2 rounded-full">
                <Timer className="text-amber-400 animate-pulse" size={28} />
            </div>
        </div>
        <h3 className="text-sm font-medium text-indigo-200 mb-4 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            Menuju 10 Malam Terakhir
            <Sparkles size={14} className="text-amber-400" />
        </h3>

        <div className="flex justify-center gap-4">
            {[
                { label: 'Hari', value: timeLeft.days },
                { label: 'Jam', value: timeLeft.hours },
                { label: 'Menit', value: timeLeft.minutes },
                { label: 'Detik', value: timeLeft.seconds },
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                    <div className="bg-white/10 w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold border border-white/10">
                        {item.value.toString().padStart(2, '0')}
                    </div>
                    <span className="text-[10px] uppercase font-bold mt-2 text-indigo-300 tracking-wider">{item.label}</span>
                </div>
            ))}
        </div>
    </div>
  )
}