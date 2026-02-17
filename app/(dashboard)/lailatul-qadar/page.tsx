import { createClient } from "@/lib/supabase/server"
import ItikafItem from "@/components/features/lailatul-qadar/ItikafItem"
import { 
    RAMADHAN_START_DATE_STR, 
    getCurrentRamadhanDay, 
    RAMADHAN_DAYS_TOTAL 
} from "@/lib/ramadhan-time"
import { Moon, Calendar, Star, Flame, CheckCircle, Sparkles, Clock } from "lucide-react"

export default async function LailatulQadarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil Data
  const { data: rawProgress } = await supabase
    .from('lailatul_qadar_progress') 
    .select('*')
    .eq('user_id', user?.id)

  // 2. FILTER & MAPPING DATA
  // Filter hari >= 21 untuk membuang data 'sampah' (jika ada) dari hari 1-20
  const progress = rawProgress?.filter(p => p.night_number >= 21) || []

  // 3. Hitung Statistik (Hanya hitung yang is_itikaf === true)
  const totalItikaf = progress.filter(p => p.is_itikaf === true).length

  // Hitung Streak (Hanya dari yang TRUE)
  const sortedDays = progress
    .filter(p => p.is_itikaf === true)
    .map(p => p.night_number)
    .sort((a, b) => a - b)

  let maxStreak = 0
  let currentStreak = 0
  
  if (sortedDays.length > 0) {
      for (let i = 0; i < sortedDays.length; i++) {
          if (i === 0 || sortedDays[i] === sortedDays[i - 1] + 1) {
              currentStreak++
          } else {
              currentStreak = 1 
          }
          maxStreak = Math.max(maxStreak, currentStreak)
      }
  }

  // 4. Waktu Saat Ini
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

  // 5. Generate List 10 Malam Terakhir
  const days = Array.from({ length: 10 }, (_, i) => {
      const dayNum = 21 + i 
      
      const date = new Date(RAMADHAN_START_DATE_STR)
      date.setDate(date.getDate() + (dayNum - 1))
      
      const dateStr = date.toLocaleDateString("id-ID", {
          weekday: 'long',
          day: 'numeric',
          month: 'short'
      })
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const dateIso = `${year}-${month}-${d}`

      // Cari data di database berdasarkan night_number
      const logData = progress.find(p => p.night_number === dayNum)
      
      // Cek apakah is_itikaf bernilai true
      const isCompleted = logData?.is_itikaf === true

      const isLocked = dayNum > currentRamadhanDay
      const isOddNight = dayNum % 2 !== 0

      return {
          day: dayNum,
          dateDisplay: dateStr,
          dateValue: dateIso,
          isCompleted: isCompleted, 
          isLocked: isLocked,
          isOddNight: isOddNight
      }
  })

  const daysToLailatulQadar = 21 - safeDay

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* HEADER DASHBOARD */}
      <div className="bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col">
        
        <div className="absolute top-10 right-20 opacity-30 animate-pulse">
            <Star size={30} className="text-yellow-200 fill-yellow-200" />
        </div>
        <div className="absolute top-20 left-10 opacity-20 animate-pulse delay-75">
            <Star size={20} className="text-white fill-white" />
        </div>
        <div className="absolute -bottom-10 right-0 opacity-10 pointer-events-none">
            <Moon size={200} />
        </div>
        
        <div className="flex justify-end w-full mb-4 md:mb-0 md:absolute md:top-6 md:right-6 z-20">
             <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/10 flex items-center gap-2 shadow-sm">
                 <Calendar size={12} className="text-indigo-200" />
                 <span>{masehiDate}</span>
                 <span className="text-white/20">|</span>
                 <Moon size={12} className="text-yellow-300 fill-yellow-300" />
                 <span className="font-bold text-yellow-100">{hijriDate}</span>
             </div>
        </div>

        <div className="relative z-10">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
                    <Sparkles className="text-yellow-400 fill-yellow-400 shrink-0" /> Sukses Lailatul Qadar
                </h1>
                <p className="text-indigo-200 text-xs md:text-sm mt-1 leading-snug max-w-[80%]">
                    Buru kemuliaan 10 malam terakhir.
                </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-2.5 md:p-3 flex items-center gap-3 min-w-30 flex-1 md:flex-none">
                    <div className="bg-indigo-500/30 p-2 rounded-full">
                        <CheckCircle size={18} className="text-indigo-200" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wider">Total I'tikaf</p>
                        <p className="text-lg md:text-xl font-bold">{totalItikaf} <span className="text-[10px] font-normal opacity-70">Malam</span></p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-2.5 md:p-3 flex items-center gap-3 min-w-30 flex-1 md:flex-none">
                    <div className={`p-2 rounded-full ${maxStreak > 2 ? "bg-purple-500/20" : "bg-gray-500/20"}`}>
                        <Flame size={18} className={maxStreak > 2 ? "text-purple-400 fill-purple-400 animate-pulse" : "text-gray-400"} />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wider">Rekor</p>
                        <p className="text-lg md:text-xl font-bold">{maxStreak} <span className="text-[10px] font-normal opacity-70">x Streak</span></p>
                    </div>
                </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 md:p-5 border border-white/10 max-w-2xl">
                <p className="text-lg md:text-2xl font-serif text-right mb-2 leading-loose text-yellow-100">
                   لَيْلَةُ الْقَدْرِ ەۙ خَيْرٌ مِّنْ اَلْفِ شَهْرٍۗ
                </p>
                <p className="text-[10px] md:text-sm text-indigo-100 italic leading-relaxed">
                    "Malam kemuliaan itu lebih baik daripada seribu bulan."
                    <span className="font-bold not-italic ml-1 text-white block md:inline md:ml-1 mt-1 md:mt-0">(QS. Al-Qadr: 3)</span>
                </p>
            </div>
            
            {daysToLailatulQadar > 0 && (
                 <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs text-yellow-100">
                    <Clock size={14} />
                    <span>Menuju 10 Malam Terakhir: <b>{daysToLailatulQadar} Hari Lagi</b></span>
                 </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map((item) => (
            <ItikafItem 
                key={item.day}
                day={item.day}
                dateDisplay={item.dateDisplay}
                dateValue={item.dateValue}
                isCompleted={item.isCompleted}
                isLocked={item.isLocked}
                isOddNight={item.isOddNight} 
            />
        ))}
      </div>

    </div>
  )
}