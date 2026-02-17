'use client'

import { toggleItikaf } from "@/app/(dashboard)/lailatul-qadar/actions"
import { Moon, CheckCircle, Star, Lock } from "lucide-react"
import { useTransition } from "react"

interface ItikafItemProps {
    day: number // Perhatikan: di page.tsx kita pakai 'day', di sini Anda pakai 'night'. Kita sesuaikan jadi 'day' agar konsisten dengan pemanggilnya, atau mapping di bawah.
    dateDisplay: string
    dateValue: string
    isCompleted: boolean
    isLocked: boolean
    isOddNight: boolean
}

// Saya sesuaikan props agar COCOK dengan yang dipanggil di page.tsx sebelumnya
export default function ItikafItem({ 
    day, 
    dateDisplay, 
    dateValue, 
    isCompleted, 
    isLocked, 
    isOddNight 
}: ItikafItemProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        if (isLocked) return // Proteksi ekstra
        startTransition(async () => {
            // Panggil server action dengan parameter yang benar
            await toggleItikaf(day, dateValue, !isCompleted)
        })
    }

    // Tentukan Style Warna (Emas jika Ganjil/Lailatul Qadar, Biru jika Genap)
    // Kita pakai prop isOddNight yang sudah dikirim dari parent
    
    // Style Dasar
    let cardClass = isOddNight 
        ? "border-amber-200 bg-amber-50" 
        : "border-emerald-100 bg-emerald-50"

    // Grayscale jika Locked
    if (isLocked) {
        cardClass = "border-gray-200 bg-gray-50 opacity-75 grayscale-[0.6]"
    }

    // Style Jika Hari Ini (Opsional: Kita tidak kirim isToday dari parent di kode sebelumnya, tapi bisa ditambahkan logicnya nanti. Sementara kita pakai highlight standard active)
    if (!isLocked && !isCompleted) {
         cardClass += " hover:shadow-md transition-shadow"
    }
    
    // Highlight jika sudah selesai (Override warna background jadi solid)
    if (isCompleted && !isLocked) {
        cardClass = isOddNight 
            ? "bg-amber-100 border-amber-300" // Selesai di malam ganjil
            : "bg-emerald-100 border-emerald-300" // Selesai di malam genap
    }

    return (
        <div className={`border rounded-xl p-5 flex flex-col justify-between h-full transition-all relative ${cardClass}`}>
            
            {/* Badge Hari Ini (Logic sederhana: jika tidak locked dan belum completed, anggap 'aktif') 
                Atau bisa dihapus jika tidak ada prop isToday
            */}

            <div>
                <div className="flex items-center gap-2 mb-2">
                    {isLocked ? (
                        <Lock className="text-gray-400" size={18} />
                    ) : isOddNight ? (
                        <Star className="text-amber-500 fill-amber-500" size={18} />
                    ) : (
                        <Moon className="text-emerald-500" size={18} />
                    )}
                    <h3 className={`font-bold text-lg ${isLocked ? "text-gray-500" : isOddNight ? "text-amber-800" : "text-emerald-800"}`}>
                        Malam ke-{day}
                    </h3>
                </div>
                
                {/* Tanggal */}
                <p className="text-xs text-gray-500 mb-1">{dateDisplay}</p>

                <p className={`text-xs font-medium ${isLocked ? "text-gray-400" : isOddNight ? "text-amber-700" : "text-emerald-600"}`}>
                    {isLocked ? "Malam belum tiba" : isOddNight ? "Potensi Besar Lailatul Qadar" : "Perbanyak Ibadah Malam"}
                </p>
            </div>

            <button 
                onClick={handleToggle}
                disabled={isPending || isLocked}
                className={`mt-4 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm
                    ${isLocked 
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300" 
                        : isCompleted 
                            ? "bg-emerald-600 text-white shadow-emerald-200" // Tombol Hijau Sukses
                            : "bg-white border hover:bg-gray-50" // Tombol Default Putih
                    }
                    ${!isLocked && !isCompleted && isOddNight ? "border-amber-300 text-amber-700" : ""}
                    ${!isLocked && !isCompleted && !isOddNight ? "border-emerald-300 text-emerald-700" : ""}
                `}
            >
                {isLocked ? (
                    <>
                        <Lock size={12} /> BELUM WAKTUNYA
                    </>
                ) : isPending ? (
                    <span className="animate-pulse">Menyimpan...</span>
                ) : isCompleted ? (
                    <>
                        <CheckCircle size={14} /> TERCATAT I'TIKAF
                    </>
                ) : (
                    "Tandai Selesai"
                )}
            </button>
        </div>
    )
}