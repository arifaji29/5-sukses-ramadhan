'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Plus, RotateCcw, BookOpenText } from 'lucide-react'

export default function DoaPopup({ isNightTime }: { isNightTime: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [count, setCount] = useState(0)
    // State baru untuk memastikan komponen sudah di-mount di sisi klien sebelum render tombol
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        if (isNightTime) {
            setIsOpen(true)
        }
        const savedCount = localStorage.getItem('doa_lailatul_qadar_count')
        if (savedCount) {
            setCount(parseInt(savedCount, 10))
        }
    }, [isNightTime])

    const handleIncrement = () => {
        const newCount = count + 1
        setCount(newCount)
        localStorage.setItem('doa_lailatul_qadar_count', newCount.toString()) 
    }

    const handleReset = () => {
        if (confirm("Yakin ingin mereset hitungan dzikir kembali ke 0?")) {
            setCount(0)
            localStorage.setItem('doa_lailatul_qadar_count', '0')
        }
    }

    // Jangan render apa-apa di server untuk menghindari hydration mismatch
    if (!isMounted) return null

    return (
        <>
            {/* --- FLOATING ACTION BUTTON (Tombol Melayang) --- */}
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 bg-linear-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group flex items-center gap-2 border border-purple-400/30"
                aria-label="Buka Doa Lailatul Qadar"
            >
                <BookOpenText size={24} className="text-yellow-300 group-hover:animate-pulse" />
                {/* Teks hanya muncul di desktop atau saat hover */}
                <span className="hidden md:block font-bold text-sm mr-1">Do'a & Dzikir</span>
            </button>

            {/* --- POPUP MODAL --- */}
            {isOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-linear-to-br from-indigo-900 to-purple-900 rounded-[28px] p-5 md:p-6 max-w-[320px] w-full shadow-2xl relative border border-purple-500/30 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 text-purple-300 hover:text-white bg-white/5 hover:bg-white/20 p-1.5 rounded-full transition-all"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-1">
                            <div className="bg-yellow-400/20 p-2.5 rounded-2xl mb-3 border border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                                <Sparkles className="text-yellow-300" size={24} />
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-3 tracking-wide">Do'a Lailatul Qadar</h3>
                            
                            {/* PERBAIKAN FONT ARAB: Ditambahkan style fontFamily khusus untuk LPMQ */}
                            <p 
                                className="text-[21px] font-normal text-yellow-300 leading-relaxed mb-3 text-center w-full drop-shadow-md" 
                                dir="rtl"
                                style={{ 
                                    fontFamily: "'LPMQ IsepMisbah', 'Traditional Arabic', serif", 
                                    lineHeight: "2" 
                                }}
                            >
                                اَللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
                            </p>
                            
                            <p className="text-[11px] text-purple-100 leading-relaxed italic mb-1.5 px-2">
                                "Ya Allah, sesungguhnya Engkau Maha Pemaaf, dan Engkau menyukai maaf, maka maafkanlah aku."
                            </p>
                            <p className="text-[10px] font-bold text-purple-300 mb-3">
                                (HR. Ibnu Majah)
                            </p>

                            <div className="bg-white/10 px-3 py-1 rounded-full mb-3 border border-white/5">
                                <p className="text-[10px] font-medium text-yellow-200">
                                    ✨ Dibaca sebanyak-banyaknya
                                </p>
                            </div>

                            <div className="w-full bg-black/20 rounded-2xl p-3.5 border border-white/10">
                                <p className="text-purple-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Bacaan</p>
                                
                                <div className="text-4xl font-black text-yellow-400 mb-3 drop-shadow-lg">
                                    {count}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleReset}
                                        className="flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white px-3 py-2 rounded-xl transition-all border border-white/10"
                                        title="Reset Dzikir"
                                    >
                                        <RotateCcw size={16} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Reset</span>
                                    </button>

                                    <button 
                                        onClick={handleIncrement}
                                        className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-bold py-2 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:scale-[1.02] active:scale-95"
                                    >
                                        <Plus size={20} /> Hitung
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}