'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Award, X, Sparkles } from 'lucide-react'

export default function RekapAmalCTA({ show }: { show: boolean }) {
    const [showPopup, setShowPopup] = useState(false)

    useEffect(() => {
        // Cek localStorage agar popup tidak muncul terus-menerus setiap kali refresh
        if (show) {
            const hasSeenPopup = localStorage.getItem('hasSeenRekapPopup')
            if (!hasSeenPopup) {
                // Beri sedikit delay agar animasinya terasa natural saat dashboard dimuat
                const timer = setTimeout(() => setShowPopup(true), 1000)
                return () => clearTimeout(timer)
            }
        }
    }, [show])

    const closePopup = () => {
        setShowPopup(false)
        localStorage.setItem('hasSeenRekapPopup', 'true')
    }

    if (!show) return null;

    return (
        <>
            {/* --- TOMBOL PERMANEN DI BAWAH BANNER --- */}
            <div className="w-full bg-emerald-50 border border-emerald-200 p-4 md:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                        <Award size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-800 text-sm md:text-base">Rekap Amalanmu Sudah Tersedia!</h3>
                        <p className="text-xs md:text-sm text-emerald-600 mt-0.5">Lihat dan unduh rapor 5 Sukses Ramadhan kamu sekarang.</p>
                    </div>
                </div>
                <Link 
                    href="/rekap" 
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors text-center text-sm flex items-center justify-center gap-2"
                >
                    <Sparkles size={16} /> Lihat Rekap
                </Link>
            </div>

            {/* --- POP-UP MODAL (Muncul sekali) --- */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 px-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        
                        <button onClick={closePopup} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 transition-colors">
                            <X size={20} />
                        </button>
                        
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 relative">
                             <Award size={40} className="text-emerald-600 relative z-10" />
                             <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-30 animate-pulse"></div>
                        </div>

                        <h2 className="text-2xl font-black text-gray-800 mb-2">Alhamdulillah!</h2>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Perjalanan Ramadhan telah selesai. Kami telah merangkum semua pencapaian ibadahmu dalam satu <strong className="text-emerald-600">Rapor 5 Sukses Ramadhan</strong> yang spesial.
                        </p>

                        <Link 
                            href="/rekap" 
                            onClick={closePopup}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} /> Lihat Rapor Sekarang
                        </Link>
                        
                        <button onClick={closePopup} className="mt-3 text-xs font-bold text-gray-400 hover:text-gray-600 py-2 px-4 rounded-lg">
                            Nanti Saja
                        </button>

                    </div>
                </div>
            )}
        </>
    )
}