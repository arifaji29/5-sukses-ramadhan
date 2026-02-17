import { createClient } from "@/lib/supabase/server"
import FastingItem from "@/components/features/puasa/FastingItem"
import {
  RAMADHAN_START_DATE_STR,
  getCurrentRamadhanDay,
  RAMADHAN_DAYS_TOTAL
} from "@/lib/ramadhan-time"
import { Sun, Calendar, Moon, Star, Flame, CheckCircle } from "lucide-react"

// --- Helper Waktu WIB (Langsung di file ini agar praktis) ---
function getWIBDate() {
  const now = new Date();
  // Hitung UTC murni
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Tambah 7 jam (WIB)
  return new Date(utc + (7 * 3600000));
}

export default async function PuasaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil Progress User
  const { data: progress } = await supabase
    .from('puasa_progress')
    .select('*')
    .eq('user_id', user?.id)

  // Hitung Total
  const totalPuasa = progress?.filter(p => p.is_fasting).length || 0

  // 2. Hitung Statistik Streak (Rekor Berturut-turut)
  const sortedDays = progress
    ?.filter(p => p.is_fasting)
    .map(p => p.day)
    .sort((a, b) => a - b) || []

  let maxStreak = 0
  let currentStreak = 0

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0 || sortedDays[i] === sortedDays[i - 1] + 1) {
      currentStreak++
    } else {
      currentStreak = 1
    }
    maxStreak = Math.max(maxStreak, currentStreak)
  }

  // 3. Waktu Saat Ini (Menggunakan WIB agar sinkron server & client)
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

  // 4. Generate List Hari dengan Logika Lock TIME-BASED (WIB)
  const days = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1
    const date = new Date(RAMADHAN_START_DATE_STR)
    date.setDate(date.getDate() + i) // Hari ke-1 = Tanggal Start

    const dateStr = date.toLocaleDateString("id-ID", {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    })

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const dateIso = `${year}-${month}-${d}`

    const logData = progress?.find(p => p.day === dayNum)

    // --- LOGIKA LOCK WIB ---
    // Target waktu buka kunci: Tanggal tersebut jam 17:30 WIB
    const unlockTime = new Date(date)
    unlockTime.setHours(17, 30, 0, 0)

    // Bandingkan dengan waktu WIB sekarang
    // Jika sekarang (WIB) < waktu buka kunci -> TERKUNCI
    const isLocked = nowWIB < unlockTime

    return {
      day: dayNum,
      dateDisplay: dateStr,
      dateValue: dateIso,
      isFasting: logData?.is_fasting || false,
      isLocked: isLocked
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      {/* HEADER DASHBOARD (Hijau Tosca) */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-900 rounded-2xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col">

        {/* Background Hiasan (Moon & Star) */}
        <div className="absolute -bottom-6 right-0 opacity-10 pointer-events-none">
          <Moon size={200} />
        </div>
        <div className="absolute top-10 right-20 opacity-20 pointer-events-none animate-pulse">
          <Star size={40} />
        </div>

        {/* WIDGET TANGGAL COMPACT */}
        <div className="flex justify-end w-full mb-4 md:mb-0 md:absolute md:top-6 md:right-6 z-20">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/10 flex items-center gap-2 shadow-sm">
            <Calendar size={12} className="text-emerald-100" />
            <span>{masehiDate}</span>
            <span className="text-white/20">|</span>
            <Moon size={12} className="text-yellow-300 fill-yellow-300" />
            <span className="font-bold text-yellow-100">{hijriDate}</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
              <Sun className="text-yellow-400 fill-yellow-400 shrink-0" /> Sukses Puasa
            </h1>
            <div className="text-emerald-100 text-xs md:text-sm mt-1 leading-snug max-w-[90%]">
                <p>Jaga lisan, mata, dan hati untuk puasa yang sempurna.</p>
                <p className="mt-1 text-emerald-300 text-[10px] italic opacity-80">(Ceklis terbuka setiap pukul 17.30 WIB)</p>
            </div>
          </div>

          {/* AREA STATISTIK */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Total */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-2.5 md:p-3 flex items-center gap-3 min-w-30 flex-1 md:flex-none">
              <div className="bg-emerald-500/30 p-2 rounded-full">
                <CheckCircle size={18} className="text-emerald-100" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-emerald-100 uppercase tracking-wider">Total</p>
                <p className="text-lg md:text-xl font-bold">{totalPuasa} <span className="text-[10px] font-normal opacity-70">Hari</span></p>
              </div>
            </div>

            {/* Rekor Streak */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-2.5 md:p-3 flex items-center gap-3 min-w-30 flex-1 md:flex-none">
              <div className={`p-2 rounded-full ${maxStreak > 2 ? "bg-orange-500/20" : "bg-gray-500/20"}`}>
                <Flame size={18} className={maxStreak > 2 ? "text-orange-400 fill-orange-400 animate-pulse" : "text-gray-400"} />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-emerald-100 uppercase tracking-wider">Rekor</p>
                <p className="text-lg md:text-xl font-bold">{maxStreak} <span className="text-[10px] font-normal opacity-70">x Streak</span></p>
              </div>
            </div>
          </div>

          {/* AYAT AL-QURAN (Al-Baqarah 183) */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-5 border border-white/10 max-w-2xl">
            <p className="text-lg md:text-xl font-serif text-right mb-2 leading-loose text-yellow-100">
              يٰٓاَيُّهَا الَّذِيْنَ اٰمَنُوْا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِيْنَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُوْنَۙ
            </p>
            <p className="text-[10px] md:text-xs text-emerald-50 italic leading-relaxed">
              "Wahai orang-orang yang beriman! Diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa."
              <span className="font-bold not-italic ml-1 text-white block md:inline md:ml-1 mt-1 md:mt-0">(QS. Al-Baqarah: 183)</span>
            </p>
          </div>
        </div>
      </div>

      {/* LIST HARI */}
      <div className="space-y-3">
        {days.map((item) => (
          <FastingItem
            key={item.day}
            day={item.day}
            dateDisplay={item.dateDisplay}
            dateValue={item.dateValue}
            isFasting={item.isFasting}
            isLocked={item.isLocked}
          />
        ))}
      </div>

    </div>
  )
}