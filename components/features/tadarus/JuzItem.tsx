'use client'

import { CheckCircle, BookOpen, Circle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface JuzItemProps {
  juzNumber: number
  title: string
  desc: string
  isCompleted: boolean
  lastRead?: {
    surah: string
    surahNumber: number 
    ayah: number
  } | null
  progressPercent?: number // 👈 Tambahan properti untuk persentase
}

export default function JuzItem({ juzNumber, title, desc, isCompleted, lastRead, progressPercent }: JuzItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // LOGIKA STATUS CARD (Visual Saja)
  let cardStyle = "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md"
  let iconColor = "bg-gray-100 text-gray-500"

  if (isCompleted) {
      cardStyle = "bg-emerald-50 border-emerald-200 shadow-sm"
      iconColor = "bg-emerald-200 text-emerald-800"
  } else if (lastRead) {
      cardStyle = "bg-amber-50 border-amber-200 hover:border-amber-300 shadow-sm"
      iconColor = "bg-amber-100 text-amber-700"
  }

  // --- LOGIKA DEEP LINKING ---
  const targetLink = (!isCompleted && lastRead && lastRead.surahNumber) 
    ? `/tadarus/juz/${juzNumber}#verse-${lastRead.surahNumber}-${lastRead.ayah}`
    : `/tadarus/juz/${juzNumber}`

  return (
    <div className="relative h-full">
      {/* Loading Overlay (Hijau & Dinamis) */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border border-emerald-100 shadow-inner pointer-events-none">
          <Loader2 className="animate-spin text-emerald-500 mb-2" size={24} />
          <span className="text-xs font-bold text-emerald-700 animate-pulse">
            Membuka Juz {juzNumber}...
          </span>
        </div>
      )}

      <Link 
        href={targetLink} 
        onClick={() => setIsLoading(true)}
        className="block h-full"
      >
          <div className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 h-full ${cardStyle}`}>
              
              {/* Header: Nomor Juz & Indikator Status */}
              <div className="flex justify-between items-start mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${iconColor}`}>
                      {juzNumber}
                  </div>
                  
                  {/* Indikator Status (Read Only) */}
                  <div>
                      {isCompleted ? (
                          <CheckCircle className="text-emerald-600 fill-emerald-100" size={28} />
                      ) : (
                          <Circle className="text-gray-200" size={28} />
                      )}
                  </div>
              </div>

              {/* Content: Judul Juz & Keterangan */}
              <div>
                  <h4 className={`font-bold ${isCompleted ? "text-emerald-900" : "text-gray-800"}`}>
                      {title}
                  </h4>
                  
                  {/* Logika Tampilan Deskripsi */}
                  {isCompleted ? (
                      <div className="mt-2 flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100/50 px-2 py-1 rounded-md w-fit">
                          <span>Alhamdulillah Selesai</span>
                      </div>
                  ) : lastRead ? (
                      <div className="mt-2">
                          <div className="flex justify-between items-end mb-1">
                              <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                                  Terakhir Dibaca:
                              </p>
                              {/* 👈 Teks Persentase Ditampilkan di Sini */}
                              {progressPercent !== undefined && (
                                  <span className="text-[10px] font-bold text-amber-600">
                                      {Math.round(progressPercent)}%
                                  </span>
                              )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold bg-white/60 px-2 py-1.5 rounded-md border border-amber-100">
                              <BookOpen size={12} />
                              <span className="truncate">{lastRead.surah} : {lastRead.ayah}</span>
                          </div>

                          {/* 👈 Visual Progress Bar Ditampilkan di Sini */}
                          {progressPercent !== undefined && (
                              <div className="w-full bg-amber-100/70 rounded-full h-1.5 mt-2.5 overflow-hidden">
                                  <div 
                                      className="bg-amber-500 h-full rounded-full transition-all duration-700 ease-out" 
                                      style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                                  />
                              </div>
                          )}
                      </div>
                  ) : (
                      <p className="text-xs mt-1 text-gray-400">
                          {desc}
                      </p>
                  )}
              </div>
          </div>
      </Link>
    </div>
  )
}