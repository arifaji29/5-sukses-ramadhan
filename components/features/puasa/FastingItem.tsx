'use client'

import { togglePuasa } from "@/app/(dashboard)/puasa/actions" 
import { useTransition } from "react"
import { CheckCircle, Circle, Lock } from "lucide-react"

interface FastingItemProps {
    day: number
    dateDisplay: string
    dateValue: string
    isFasting: boolean
    isLocked: boolean
}

export default function FastingItem({ day, dateDisplay, dateValue, isFasting, isLocked }: FastingItemProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        if (isLocked) return // Cegah klik jika terkunci
        
        startTransition(async () => {
            // Panggil server action dengan format tanggal yang benar
            await togglePuasa(day, dateValue, !isFasting)
        })
    }

    return (
        <div 
            onClick={!isLocked ? handleToggle : undefined}
            className={`
                border rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer group select-none
                ${isLocked 
                    ? "bg-gray-50 border-gray-100 opacity-60 grayscale cursor-not-allowed" // Tampilan Locked
                    : isFasting
                        ? "bg-emerald-50 border-emerald-200" // Tampilan Berhasil (Hijau)
                        : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm" // Tampilan Belum
                }
            `}
        >
            <div>
                <h3 className={`font-bold ${isLocked ? "text-gray-400" : isFasting ? "text-emerald-800" : "text-gray-800"}`}>
                    Hari ke-{day}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    {dateDisplay}
                    {isLocked && <Lock size={10} className="text-gray-400" />}
                </p>
            </div>

            <div className="relative">
                {isPending ? (
                    // Loading Spinner Hijau
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                ) : isLocked ? (
                    // Ikon Gembok
                    <Lock className="text-gray-300" size={24} />
                ) : isFasting ? (
                    // Checklist Hijau
                    <CheckCircle className="text-emerald-500 fill-emerald-100" size={28} />
                ) : (
                    // Lingkaran Kosong
                    <Circle className="text-gray-300 group-hover:text-emerald-400 transition-colors" size={28} />
                )}
            </div>
        </div>
    )
}