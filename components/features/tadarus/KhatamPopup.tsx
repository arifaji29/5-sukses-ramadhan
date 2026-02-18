'use client'

import { useState, useEffect, useTransition } from "react"
import { Trophy, Loader2, Sparkles, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"
import { resetCurrentPeriod } from "@/app/(dashboard)/tadarus/actions"
import { useRouter } from "next/navigation"

export default function KhatamPopup({ 
    isOpen, 
    khatamCountNext 
}: { 
    isOpen: boolean, 
    khatamCountNext: number 
}) {
    const [show, setShow] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            setShow(true)
            
            // Efek Confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [isOpen])

    const handleLanjut = () => {
        startTransition(async () => {
            await resetCurrentPeriod()
            setShow(false)
            router.push('/tadarus') 
            router.refresh()
        })
    }

    if (!show) return null

    // Hitung khatam ke berapa yang baru saja diselesaikan
    // khatamCountNext adalah jumlah riwayat SEBELUMNYA, jadi yang baru selesai adalah +1
    const currentKhatam = khatamCountNext + 1;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl border-4 border-yellow-100 overflow-hidden scale-100 animate-in zoom-in-95 duration-300">
                
                {/* Hiasan Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-yellow-50 to-transparent -z-10"></div>
                
                {/* Icon Utama */}
                <div className="relative inline-block mb-6 mt-2">
                    <div className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl animate-pulse opacity-50"></div>
                    <div className="relative bg-linear-to-br from-yellow-300 to-yellow-500 w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white mx-auto">
                        <Trophy size={48} className="text-white drop-shadow-md" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                        <Sparkles size={12} /> Selesai
                    </div>
                </div>

                {/* Teks Judul */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Alhamdulillah!</h2>
                
                {/* Deskripsi Revisi */}
                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                    Selamat! Anda telah menyelesaikan <strong>30 Juz</strong>.<br/>
                    Ini adalah pencapaian khatam ke-<span className="font-bold text-emerald-600">{currentKhatam}</span> Anda.
                    <br/><br/>
                    Klik tombol di bawah untuk mencatat riwayat khatam ini dan memulai progres baru.
                </p>

                {/* Tombol Utama Revisi */}
                <button
                    onClick={handleLanjut}
                    disabled={isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                    {isPending ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <span>Mulai Progres Baru</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

            </div>
        </div>
    )
}