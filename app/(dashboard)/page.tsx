import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Sun, Moon, BookOpen, Star, CheckCircle, Trophy, ArrowRight, Zap, Calendar } from "lucide-react"
import { 
    getCurrentRamadhanDay, 
    RAMADHAN_DAYS_TOTAL 
} from "@/lib/ramadhan-time"

// --- Helper Waktu WIB ---
function getWIBDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000)); // UTC + 7 Jam
}

// --- 1. DEFINISI WARNA (PENTING AGAR TAILWIND TIDAK MENGHAPUS CLASS) ---
const COLOR_MAP = {
    orange: { text: "text-orange-500", bg: "bg-orange-500", soft: "bg-orange-500/10" },
    violet: { text: "text-violet-500", bg: "bg-violet-500", soft: "bg-violet-500/10" },
    blue:   { text: "text-blue-500",   bg: "bg-blue-500",   soft: "bg-blue-500/10" },
    yellow: { text: "text-yellow-500", bg: "bg-yellow-500", soft: "bg-yellow-500/10" },
    green:  { text: "text-green-600",  bg: "bg-green-600",  soft: "bg-green-600/10" },
};

type ColorTheme = keyof typeof COLOR_MAP;

// --- Helper Component: Card Progress (FIXED) ---
function ProgressCard({ 
    href, title, icon: Icon, theme, 
    progressValue, progressMax, progressLabel, 
    points, delay 
}: { 
    href: string, title: string, icon: any, theme: ColorTheme, 
    progressValue: number, progressMax: number, progressLabel: string,
    points: number, delay: string 
}) {
    const percent = Math.min(100, Math.round((progressValue / progressMax) * 100)) || 0
    
    // Ambil class warna dari Map (Dijamin terbaca oleh Tailwind)
    const colors = COLOR_MAP[theme];

    return (
        <Link 
            href={href} 
            className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full"
            style={{ animationDelay: delay }}
        >
            {/* Background Abstrak */}
            <div className={`absolute top-0 right-0 p-16 opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${colors.bg}`} />
            
            <div className="relative z-10 w-full">
                <div className="flex justify-between items-start mb-4">
                    {/* Icon Soft Background */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.text} ${colors.soft}`}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    
                    {/* Badge Poin */}
                    <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Zap size={12} className="fill-yellow-500 text-yellow-500" />
                        {points} Poin
                    </div>
                </div>

                <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">{title}</h3>
                
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Progress</span>
                        <span className="text-gray-900">{progressLabel}</span>
                    </div>
                    {/* Bar Background */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        {/* Bar Fill (Warna Utama) */}
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bg}`} 
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-emerald-600 transition-colors relative z-10">
                Lihat Detail <ArrowRight size={14} className="ml-auto transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // --- 1. FETCH DATA ---
  const { data: puasaData } = await supabase.from('puasa_progress').select('is_fasting').eq('user_id', user.id).eq('is_fasting', true)
  const { data: tarawihData } = await supabase.from('tarawih_progress').select('location').eq('user_id', user.id)
  const { data: quranData } = await supabase.from('quran_progress').select('completion_count').eq('user_id', user.id)
  const { data: userSettings } = await supabase.from('user_settings').select('total_khatam_count').eq('user_id', user.id).single()
  const { data: itikafData } = await supabase.from('lailatul_qadar_progress').select('night_number, is_itikaf').eq('user_id', user.id).eq('is_itikaf', true)
  const { data: zakatData } = await supabase.from('zakat_fitrah_progress').select('is_paid').eq('user_id', user.id).single()

  // --- 2. LOGIKA POIN ---
  const puasaCount = puasaData?.length || 0
  const puasaPoints = puasaCount * 1

  let tarawihPoints = 0
  const tarawihCount = tarawihData?.length || 0
  tarawihData?.forEach((t) => {
      const lokasi = t.location ? t.location.toLowerCase() : ''
      if (lokasi === 'masjid') {
          tarawihPoints += 2
      } else {
          tarawihPoints += 1
      }
  })

  const juzCompletedCount = quranData?.filter(q => q.completion_count > 0).length || 0
  const khatamCount = userSettings?.total_khatam_count || 0
  const tadarusPoints = (juzCompletedCount * 5) + (khatamCount * 2)

  let itikafPoints = 0
  const itikafCount = itikafData?.length || 0
  itikafData?.forEach((i) => {
      const isOdd = i.night_number % 2 !== 0
      itikafPoints += (isOdd ? 2 : 1)
  })

  const isZakatPaid = zakatData?.is_paid || false
  const zakatPoints = isZakatPaid ? 2 : 0

  const totalGlobalPoints = puasaPoints + tarawihPoints + tadarusPoints + itikafPoints + zakatPoints
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || "Hamba Allah"

  // --- 3. LOGIKA TANGGAL (WIB) ---
  const nowWIB = getWIBDate();
  const currentRamadhanDay = getCurrentRamadhanDay()
  const safeDay = Math.max(1, Math.min(currentRamadhanDay, RAMADHAN_DAYS_TOTAL))
  
  const masehiDate = nowWIB.toLocaleDateString("id-ID", {
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
  })
  const hijriDate = `${safeDay} Ramadhan`

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* SECTION 1: WELCOME BANNER */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none">
            <Star size={300} />
         </div>

         <div className="relative z-10">
             {/* 1. WIDGET TANGGAL */}
             <div className="inline-flex bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/10 items-center gap-2 shadow-sm mb-4">
                 <Calendar size={12} className="text-emerald-200" />
                 <span>{masehiDate}</span>
                 <span className="text-white/20">|</span>
                 <Moon size={12} className="text-yellow-300 fill-yellow-300" />
                 <span className="font-bold text-yellow-100">{hijriDate}</span>
             </div>

             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 {/* 2. TEXT GREETING */}
                 <div className="max-w-lg">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Assalamu'alaikum, {displayName}!
                    </h1>
                    <p className="text-emerald-100 text-sm leading-relaxed">
                        Terus semangat kumpulkan poin kebaikan di bulan Ramadhan ini.
                    </p>
                 </div>

                 {/* 3. SCORE CARD */}
                 <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-37.5 text-center self-end md:self-auto shadow-lg">
                    <div className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Total Poin</div>
                    <div className="text-4xl font-extrabold text-yellow-300 drop-shadow-sm flex items-center justify-center gap-2">
                        <Trophy size={28} className="text-yellow-400" />
                        {totalGlobalPoints}
                    </div>
                 </div>
             </div>
         </div>
      </div>

      {/* SECTION 2: GRID MENU PROGRESS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-500 rounded-full"/>
            Progress Ibadah Kamu
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <ProgressCard 
                href="/puasa"
                title="1. Sukses Puasa"
                icon={Sun}
                theme="orange" // Menggunakan theme, bukan class manual
                progressValue={puasaCount}
                progressMax={30}
                progressLabel={`${puasaCount} / 30 Hari`}
                points={puasaPoints}
                delay="0ms"
            />
             <ProgressCard 
                href="/tarawih"
                title="2. Sukses Tarawih"
                icon={Moon}
                theme="violet" 
                progressValue={tarawihCount}
                progressMax={30}
                progressLabel={`${tarawihCount} / 30 Malam`}
                points={tarawihPoints}
                delay="100ms"
            />
             <ProgressCard 
                href="/tadarus"
                title="3. Sukses Tadarus"
                icon={BookOpen}
                theme="blue" 
                progressValue={juzCompletedCount}
                progressMax={30}
                progressLabel={`${juzCompletedCount} / 30 Juz`}
                points={tadarusPoints}
                delay="200ms"
            />
             <ProgressCard 
                href="/lailatul-qadar"
                title="4. Lailatul Qadar"
                icon={Star}
                theme="yellow" 
                progressValue={itikafCount}
                progressMax={10}
                progressLabel={`${itikafCount} / 10 Malam`}
                points={itikafPoints}
                delay="300ms"
            />
             <ProgressCard 
                href="/zakat"
                title="5. Sukses Zakat"
                icon={CheckCircle}
                theme="green" 
                progressValue={isZakatPaid ? 1 : 0}
                progressMax={1}
                progressLabel={isZakatPaid ? "Sudah Bayar" : "Belum Bayar"}
                points={zakatPoints}
                delay="400ms"
            />
        </div>
      </div>
    </div>
  )
}