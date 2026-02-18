'use client'

import { updateKhatamTarget } from "@/app/(dashboard)/tadarus/actions"
import { Target, Trophy, Flame, Loader2, CheckCircle, AlertCircle, Medal } from "lucide-react"
import { useState, useTransition } from "react"
import { getCurrentRamadhanDay, RAMADHAN_DAYS_TOTAL } from "@/lib/ramadhan-time" 

interface TargetCardProps {
  currentTarget: number
  juzCompletedToday: number 
  totalReadGlobal: number
  khatamCount: number // UPDATE: Tambahkan prop ini
}

export default function TargetCard({ currentTarget, juzCompletedToday, totalReadGlobal, khatamCount }: TargetCardProps) {
  const [isPending, startTransition] = useTransition()
  const [target, setTarget] = useState(currentTarget)
  
  // 1. AMBIL HARI REALTIME
  const currentDay = getCurrentRamadhanDay()
  const safeDay = Math.max(1, Math.min(currentDay, RAMADHAN_DAYS_TOTAL))

  const handleTargetChange = (newTarget: number) => {
    setTarget(newTarget)
    startTransition(async () => {
      await updateKhatamTarget(newTarget)
    })
  }

  // ================= LOGIKA TABUNGAN / UTANG =================
  const TOTAL_TARGET_JUZ = target * RAMADHAN_DAYS_TOTAL 

  // Target Ideal per Hari ini
  const idealProgressByYesterday = (TOTAL_TARGET_JUZ / RAMADHAN_DAYS_TOTAL) * (safeDay - 1)
  
  // Selisih
  const gap = totalReadGlobal - idealProgressByYesterday
  
  // Hitung Beban Harian Baru
  const remainingJuzNeeded = Math.max(0, TOTAL_TARGET_JUZ - totalReadGlobal)
  const daysRemaining = RAMADHAN_DAYS_TOTAL - safeDay + 1 
  
  const dynamicDailyTarget = daysRemaining > 0 
    ? Math.ceil(remainingJuzNeeded / daysRemaining) 
    : 0

  const remainingToday = Math.max(0, dynamicDailyTarget - juzCompletedToday)
  const isDailyGoalReached = remainingToday === 0
  // ===========================================================

  return (
    <div className="bg-linear-to-br from-sky-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Target size={120} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start mt-2 md:mt-0">
        
        {/* Bagian Kiri: Info Target & Khatam */}
        <div className="space-y-4 flex-1 w-full pt-2 md:pt-0">
            <div>
                {/* UPDATE: Header dengan Badge Jumlah Khatam */}
                <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                    <h2 className="text-sky-100 font-medium text-sm flex items-center gap-2">
                        <Target size={16} /> Pilih Target
                    </h2>
                    
                    {/* BADGE JUMLAH KHATAM */}
                    <div className="bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 text-yellow-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Medal size={14} className="text-yellow-400" />
                        <span>Sudah Khatam: {khatamCount}x</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h3 className="text-3xl font-bold min-w-35">
                        {target}x Khatam
                    </h3>
                    
                    {/* Range Target 1-10 */}
                    <div className="flex flex-wrap gap-1 bg-white/20 p-1 rounded-lg backdrop-blur-sm max-w-md">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleTargetChange(num)}
                                disabled={isPending}
                                className={`w-8 h-8 rounded-md text-sm font-bold transition-all flex items-center justify-center
                                    ${target === num 
                                        ? "bg-white text-blue-900 shadow-sm scale-110" 
                                        : "text-sky-100 hover:bg-white/10"
                                    }
                                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Global */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    {gap >= -0.5 ? (
                         <div className="flex items-center gap-2 bg-sky-500/30 px-3 py-1.5 rounded-full border border-sky-400/30 text-sky-50">
                            <CheckCircle size={16} className="text-sky-300" />
                            <span className="font-medium">Progress Sesuai Jadwal (On Track)</span>
                         </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-pink-500/30 px-3 py-1.5 rounded-full border border-pink-400/30 text-pink-50">
                            <AlertCircle size={16} className="text-pink-300 shrink-0" />
                            <span className="font-medium text-xs md:text-sm">
                                Ayo kejar ketertinggalan!
                            </span>
                         </div>
                    )}
                </div>

                <p className="text-sky-100/80 text-xs mt-3 leading-relaxed max-w-md">
                    *Target harian otomatis disesuaikan. {gap < -0.5 ? "Semangat! Sedikit lagi target tercapai." : "Pertahankan konsistensi ini!"}
                </p>
            </div>
        </div>

        {/* Bagian Kanan: Status Hari Ini */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl min-w-50 text-center w-full md:w-auto self-stretch flex flex-col justify-center">
            {isPending ? (
                 <div className="flex justify-center py-4">
                     <Loader2 className="animate-spin" />
                 </div>
            ) : isDailyGoalReached ? (
                <div className="animate-pulse">
                    <div className="flex justify-center mb-2">
                        <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full">
                            <Trophy size={24} className="fill-yellow-900" />
                        </div>
                    </div>
                    <p className="font-bold text-lg">Target Harian Tercapai!</p>
                    <p className="text-xs text-sky-100">Hebat! Pertahankan ya.</p>
                </div>
            ) : (
                <div>
                    <div className="flex justify-center mb-2">
                        <div className={`p-2 rounded-full border ${gap < -0.5 ? "bg-pink-500/20 text-pink-200 border-pink-500/30" : "bg-orange-500/20 text-orange-200 border-orange-500/30"}`}>
                            <Flame size={24} className={gap < -0.5 ? "animate-pulse" : ""} />
                        </div>
                    </div>
                    <p className="text-xs text-sky-200 font-medium uppercase tracking-wider mb-1">MISI HARI INI</p>
                    <p className="text-2xl font-bold mb-1">
                        {juzCompletedToday} <span className="text-sm font-normal text-sky-200">/ {dynamicDailyTarget} Juz</span>
                    </p>
                    <p className="text-xs bg-black/20 py-1 px-2 rounded text-sky-100 inline-block">
                        Kurang {remainingToday} Juz lagi
                    </p>
                </div>
            )}
        </div>

      </div>
    </div>
  )
}