'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'
import { Download, Sun, Moon, BookOpen, Star, CheckCircle, Award, Loader2, User } from 'lucide-react'
import localFont from 'next/font/local'

const lpmqIsepMisbah = localFont({
  src: '../../../app/fonts/LPMQ IsepMisbah.ttf', 
  display: 'swap',
})

interface RekapProps {
    userName: string;
    avatarUrl: string | null;
    rank: number | string;
    stats: {
        puasa: { count: number, points: number };
        tarawih: { count: number, points: number };
        tadarus: { khatam: number, points: number }; 
        itikaf: { count: number, points: number };  
        zakat: { isPaid: boolean, points: number };
        totalPoints: number;
        ramadhanDaysTotal: number; 
    }
}

export default function RaporAmal({ userName, avatarUrl, rank, stats }: RekapProps) {
    const raporRef = useRef<HTMLDivElement>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    // 👈 TAHUN HIJRIAH DINAMIS
    const hijriYear = new Intl.DateTimeFormat('id-TN-u-ca-islamic-umalqura', { year: 'numeric' }).format(new Date());

    // --- LOGIKA PERSENTASE DINAMIS BERDASARKAN POIN & HARI ---
    const maxPuasaPoints = stats.ramadhanDaysTotal * 3;
    const maxTarawihPoints = stats.ramadhanDaysTotal * 2;
    const itikafMaxDays = Math.max(1, stats.ramadhanDaysTotal - 20); // 9 atau 10 malam

    const puasaPercent = Math.min(100, Math.round((stats.puasa.points / maxPuasaPoints) * 100)) || 0;
    const tarawihPercent = Math.min(100, Math.round((stats.tarawih.points / maxTarawihPoints) * 100)) || 0;
    const itikafPercent = Math.min(100, Math.round((stats.itikaf.count / itikafMaxDays) * 100)) || 0;

    const chartData = [
        { subject: 'Puasa', score: puasaPercent, full: 100 },
        { subject: 'Tarawih', score: tarawihPercent, full: 100 },
        { subject: 'Tadarus', score: Math.min(100, stats.tadarus.khatam > 0 ? 100 : 20), full: 100 }, 
        { subject: 'L. Qadar', score: itikafPercent, full: 100 },
        { subject: 'Zakat', score: stats.zakat.isPaid ? 100 : 0, full: 100 },
    ]

    const renderPolarAngleAxisTick = (props: any) => {
        const { payload, x, y, cx, cy } = props;
        const dx = (x - cx) * 0.12; 
        const dy = (y - cy) * 0.12; 
        
        let textAnchor: "middle" | "start" | "end" = "middle";
        if (x > cx + 20) textAnchor = "start";
        if (x < cx - 20) textAnchor = "end";

        return (
            <text x={x + dx} y={y + dy} textAnchor={textAnchor} fill="#a7f3d0" fontSize={10} fontWeight="bold" dominantBaseline="middle">
                {payload.value}
            </text>
        );
    };

    const handleDownload = async () => {
        if (!raporRef.current) return
        setIsDownloading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            const dataUrl = await toPng(raporRef.current, { 
                quality: 1, 
                pixelRatio: 2, 
                cacheBust: true,
                width: 360,
                height: 640,
                style: { transform: 'scale(1)', margin: '0' }
            })
            const link = document.createElement('a')
            link.download = `Rapor-Amal-Ramadhan-${userName.replace(/\s+/g, '-')}.png`
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error("Gagal mengunduh rapor:", err)
            alert("Maaf, terjadi kesalahan saat menyimpan gambar.")
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full mx-auto pb-10">
            
            <div 
                ref={raporRef} 
                className="w-90 h-160 bg-linear-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-5.5 shadow-2xl relative overflow-hidden border-2 border-emerald-500/30 flex flex-col justify-between"
            >
                <div className="absolute -top-12.5 -right-12.5 opacity-10 pointer-events-none">
                    <Star size={180} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="absolute -bottom-5 -left-5 opacity-10 pointer-events-none">
                    <Moon size={130} className="text-emerald-200 fill-emerald-200" />
                </div>

                <div className="text-center relative z-10 flex flex-col items-center shrink-0 mt-1">
                    <div className="w-14 h-14 rounded-full border-[3px] border-emerald-400/50 shadow-lg overflow-hidden mb-2 bg-slate-800 flex items-center justify-center relative">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                            <User size={20} className="text-emerald-400" />
                        )}
                    </div>

                    <div className="inline-flex items-center justify-center bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full mb-1.5">
                        <Award size={12} className="text-yellow-400 mr-1.5" />
                        {/* 👈 MENGGUNAKAN VARIABEL hijriYear DI SINI */}
                        <span className="text-[8px] font-bold text-emerald-100 tracking-widest uppercase">
                            Rapor 5 Sukses Ramadhan {hijriYear} 
                        </span>
                    </div>
                    
                    <h2 className="text-xl font-black text-white mb-0.5">{userName}</h2>
                    <p className="text-emerald-300 text-[10px] font-medium flex items-center gap-1.5 justify-center">
                        <span>Peringkat: <strong className="text-yellow-400">#{rank}</strong></span>
                        <span className="opacity-50">•</span>
                        <span>Total Poin: <strong className="text-white">{stats.totalPoints}</strong></span>
                    </p>
                </div>

                <div className="w-full flex-1 relative z-10 bg-black/20 rounded-xl p-1 border border-white/5 my-2 min-h-42.5 max-h-50">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                            <PolarGrid stroke="rgba(255,255,255,0.2)" />
                            <PolarAngleAxis dataKey="subject" tick={renderPolarAngleAxisTick} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name={userName}
                                dataKey="score"
                                stroke="#fbbf24" 
                                strokeWidth={2}
                                fill="#10b981" 
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-1.5 relative z-10 shrink-0">
                    <StatItem 
                        icon={Sun} label="Puasa" points={stats.puasa.points} 
                        desc={`${puasaPercent}%`} 
                    />
                    <StatItem 
                        icon={Moon} label="Tarawih" points={stats.tarawih.points} 
                        desc={`${tarawihPercent}%`} 
                    />
                    <StatItem 
                        icon={BookOpen} label="Tadarus" points={stats.tadarus.points} 
                        desc={`Khatam\u00A0${stats.tadarus.khatam}x`} 
                    />
                    <StatItem 
                        icon={Star} label="L. Qadar" points={stats.itikaf.points} 
                        desc={`${itikafPercent}%`} 
                    />
                    
                    <div className="col-span-2 bg-white/10 rounded-xl p-2 flex items-center justify-between border border-white/10">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className={stats.zakat.isPaid ? "text-yellow-400" : "text-gray-400"} size={14} />
                            <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider">Zakat Fitrah</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-base font-black text-white leading-none">{stats.zakat.points}</span>
                                <span className="text-[8px] text-yellow-400 font-bold">pts</span>
                            </div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 whitespace-nowrap ${stats.zakat.isPaid ? "bg-emerald-900/50 text-emerald-300 border-emerald-500/30" : "bg-gray-500/50 text-gray-300 border-gray-400/30"}`}>
                                {stats.zakat.isPaid ? "Tertunaikan" : "Belum"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-2 pt-2 border-t border-white/10 text-center relative z-10 shrink-0 flex flex-col items-center">
                    <p 
                        dir="rtl" 
                        className={`${lpmqIsepMisbah.className} text-sm text-white mb-2 tracking-normal opacity-95 drop-shadow-md`} 
                        style={{ lineHeight: "2" }}
                    >
                        تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ
                    </p>
                    <p className="text-[5px] text-emerald-200/60 font-medium tracking-widest uppercase">Dibuat melalui aplikasi #5SuksesRamadhan</p>
                </div>
            </div>

            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 w-full max-w-90 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-70"
            >
                {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                {isDownloading ? 'Menyiapkan Gambar...' : 'Unduh Rapor'}
            </button>
        </div>
    )
}

function StatItem({ icon: Icon, label, points, desc }: { icon: any, label: string, points: number, desc: string }) {
    return (
        <div className="bg-white/10 rounded-xl p-2 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                    <Icon size={10} className="text-emerald-300" />
                    <span className="text-[8px] font-bold text-emerald-200 uppercase tracking-wider">{label}</span>
                </div>
            </div>
            <div className="flex items-end justify-between mt-0.5 overflow-hidden gap-1">
                <div className="flex items-baseline gap-0.5 shrink-0">
                    <span className="text-lg font-black text-white leading-none">{points}</span>
                    <span className="text-[8px] text-yellow-400 font-bold">pts</span>
                </div>
                <span className="text-[8px] font-bold text-emerald-100 bg-emerald-900/60 border border-emerald-500/20 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 w-max">
                    {desc}
                </span>
            </div>
        </div>
    )
}