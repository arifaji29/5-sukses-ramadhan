'use client'

import { Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { getZakatDeadline } from "@/lib/ramadhan-time" // IMPORT DARI LIB

export default function ZakatCountdown() {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number} | null>(null)

  useEffect(() => {
    // 1. AMBIL DEADLINE DINAMIS DARI LIB
    const deadline = getZakatDeadline().getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = deadline - now

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
        clearInterval(timer)
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!timeLeft) return null 

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-orange-900">
        <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full shrink-0">
                <Clock className="text-orange-600 animate-pulse" size={24} />
            </div>
            <div>
                <h3 className="font-bold text-sm md:text-base">Batas Akhir Pembayaran</h3>
                <p className="text-xs text-orange-700 opacity-80">30 Ramadhan, Pukul 23.59</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <div className="text-center">
                <div className="bg-white px-3 py-2 rounded-lg font-bold text-xl border border-orange-100 shadow-sm min-w-12.5">
                    {timeLeft.days}
                </div>
                <span className="text-[10px] uppercase font-bold mt-1 block opacity-60">Hari</span>
            </div>
            <span className="font-bold text-orange-300">:</span>
            <div className="text-center">
                <div className="bg-white px-3 py-2 rounded-lg font-bold text-xl border border-orange-100 shadow-sm min-w-12.5">
                    {timeLeft.hours}
                </div>
                <span className="text-[10px] uppercase font-bold mt-1 block opacity-60">Jam</span>
            </div>
            <span className="font-bold text-orange-300">:</span>
            <div className="text-center">
                <div className="bg-white px-3 py-2 rounded-lg font-bold text-xl border border-orange-100 shadow-sm min-w-12.5">
                    {timeLeft.minutes}
                </div>
                <span className="text-[10px] uppercase font-bold mt-1 block opacity-60">Menit</span>
            </div>
        </div>
    </div>
  )
}