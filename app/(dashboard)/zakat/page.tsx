import { createClient } from "@/lib/supabase/server"
import ZakatForm from "@/components/features/zakat/ZakatForm"
import ZakatCountdown from "@/components/features/zakat/ZakatCountdown" 
import { HandHeart, Calendar, Moon } from "lucide-react"
import { 
    RAMADHAN_START_DATE_STR, 
    getCurrentRamadhanDay, 
    RAMADHAN_DAYS_TOTAL 
} from "@/lib/ramadhan-time"

export default async function ZakatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil Data Zakat
  const { data: zakat } = await supabase
    .from('zakat_fitrah_progress')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  // 2. Waktu Saat Ini (Untuk Widget Tanggal)
  const currentRamadhanDay = getCurrentRamadhanDay()
  const safeDay = Math.max(1, Math.min(currentRamadhanDay, RAMADHAN_DAYS_TOTAL))
  
  const now = new Date()
  const masehiDate = now.toLocaleDateString("id-ID", {
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
  })
  const hijriDate = `${safeDay} Ramadhan`

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Header Dashboard */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col">
        
        {/* Dekorasi Background */}
        <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
            <HandHeart size={200} />
        </div>

        {/* WIDGET TANGGAL (Pojok Kanan Atas) */}
        <div className="flex justify-end w-full mb-4 md:mb-0 md:absolute md:top-6 md:right-6 z-20">
             <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/10 flex items-center gap-2 shadow-sm">
                 <Calendar size={12} className="text-emerald-200" />
                 <span>{masehiDate}</span>
                 <span className="text-white/20">|</span>
                 <Moon size={12} className="text-yellow-300 fill-yellow-300" />
                 <span className="font-bold text-yellow-100">{hijriDate}</span>
             </div>
        </div>
        
        <div className="relative z-10">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <HandHeart className="text-emerald-200" size={32} /> Sukses Zakat Fitrah
                </h1>
                <p className="text-emerald-100 text-xs md:text-sm mt-1 leading-snug max-w-[80%]">
                    Sucikan jiwa dengan menunaikan kewajiban Zakat Fitrah.
                </p>
            </div>

            {/* HADITS LENGKAP (Arab & Arti) */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-lg md:text-xl font-serif text-right mb-3 leading-loose text-yellow-100">
                    فَرَضَ رَسُولُ اللَّهِ - صلى الله عليه وسلم - زَكَاةَ الْفِطْرِ صَاعًا مِنْ تَمْرٍ ، أَوْ صَاعًا مِنْ شَعِيرٍ عَلَى الْعَبْدِ وَالْحُرِّ ، وَالذَّكَرِ وَالأُنْثَى ، وَالصَّغِيرِ وَالْكَبِيرِ مِنَ الْمُسْلِمِينَ وَأَمَرَ بِهَا أَنْ تُؤَدَّى قَبْلَ خُرُوجِ النَّاسِ إِلَى الصَّلاَةِ
                </p>
                <p className="text-[10px] md:text-xs text-emerald-50 italic leading-relaxed">
                    "Rasulullah SAW mewajibkan zakat fitrah satu sha’ kurma atau satu sha’ gandum atas umat muslim; baik hamba sahaya maupun merdeka, laki-laki maupun perempuan, kecil maupun besar. Beliau memerintahkannya dilaksanakan sebelum orang-orang keluar untuk shalat (Id)."
                    <span className="font-bold not-italic ml-1 text-white block md:inline md:ml-1 mt-1 md:mt-0">(HR. Bukhari & Muslim)</span>
                </p>
            </div>
        </div>
      </div>

      {/* Counter Waktu Mundur (Tampil jika belum bayar) */}
      {!zakat?.is_paid && (
        <ZakatCountdown />
      )}

      {/* Form / Status Card */}
      <ZakatForm data={zakat} />

    </div>
  )
}