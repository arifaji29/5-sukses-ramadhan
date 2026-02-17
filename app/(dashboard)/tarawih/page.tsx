import { createClient } from "@/lib/supabase/server"
import TarawihItem from "@/components/features/tarawih/TarawihItem"
import {
  RAMADHAN_START_DATE_STR,
  getCurrentRamadhanDay,
  RAMADHAN_DAYS_TOTAL
} from "@/lib/ramadhan-time"
import { Moon, Calendar, Flame, CheckCircle, Star } from "lucide-react"

// --- Helper Waktu WIB (Penting untuk mengatasi timezone server) ---
function getWIBDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000)); // UTC + 7 Jam
}

export default async function TarawihPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil Data Progress
  const { data: progress } = await supabase
    .from('tarawih_progress')
    .select('*')
    .eq('user_id', user?.id)

  const totalTarawih = progress?.length || 0

  // --- LOGIKA HITUNG STREAK ---
  const sortedDays = progress?.map(p => p.day).sort((a, b) => a - b) || []
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

  // --- WAKTU SAAT INI (WIB) ---
  const nowWIB = getWIBDate();

  // Format Header
  const currentRamadhanDay = getCurrentRamadhanDay()
  const safeDay = Math.max(1, Math.min(currentRamadhanDay, RAMADHAN_DAYS_TOTAL))

  const masehiDate = nowWIB.toLocaleDateString("id-ID", {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const hijriDate = `${safeDay} Ramadhan`

  // --- GENERATE LIST HARI ---
  const days = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1

    // 1. Tentukan Tanggal Masehi (Mundur 1 hari dari Start Puasa untuk Tarawih)
    // Tarawih dilakukan pada malam sebelumnya (Malam 1 Ramadhan = H-1 Puasa)
    const date = new Date(RAMADHAN_START_DATE_STR)
    date.setDate(date.getDate() + (i - 1))

    // 2. Format Tampilan
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

    // 3. LOGIKA LOCK BY TIME (PUKUL 20:00 WIB)
    // Kunci terbuka hanya jika waktu sekarang >= Pukul 20:00 WIB pada tanggal tersebut
    const unlockTime = new Date(date)
    unlockTime.setHours(20, 0, 0, 0) // Set ke Pukul 20:00:00

    // Bandingkan dengan waktu WIB sekarang
    const isLocked = nowWIB < unlockTime

    return {
      day: dayNum,
      dateDisplay: dateStr,
      dateValue: dateIso,
      location: logData?.location || null,
      isLocked: isLocked, // Status lock real-time (WIB)
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      {/* HEADER DASHBOARD */}
      <div className="bg-linear-to-br from-violet-600 to-indigo-900 rounded-2xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col">

        <div className="absolute -bottom-10 right-0 opacity-10 pointer-events-none">
          <Moon size={240} />
        </div>
        {/* Tambahan hiasan bintang agar senada dengan desain login */}
        <div className="absolute top-10 right-20 opacity-20 pointer-events-none animate-pulse">
            <Star size={40} />
        </div>

        {/* Widget Tanggal */}
        <div className="flex justify-end w-full mb-4 md:mb-0 md:absolute md:top-6 md:right-6 z-20">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/10 flex items-center gap-2 shadow-sm">
            <Calendar size={12} className="text-violet-200" />
            <span>{masehiDate}</span>
            <span className="text-white/20">|</span>
            <Moon size={12} className="text-yellow-300 fill-yellow-300" />
            <span className="font-bold text-yellow-100">{hijriDate}</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
              <Moon className="text-yellow-400 fill-yellow-400 shrink-0" /> Sukses Tarawih
            </h1>
            <div className="text-violet-200 text-xs md:text-sm mt-1 leading-snug max-w-[90%]">
                 <p>Raih sukses ramadhan dengan perbanyak sholat malam.</p>
                 <p className="mt-1 text-violet-300 text-[10px] italic opacity-80">(Ceklis terbuka setiap pukul 20.00 WIB)</p>
            </div>
          </div>

          {/* AREA STATISTIK */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-2.5 md:p-3 flex items-center gap-3 min-w-30 flex-1 md:flex-none">
              <div className="bg-violet-500/30 p-2 rounded-full">
                <CheckCircle size={18} className="text-violet-200" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-violet-200 uppercase tracking-wider">Total</p>
                <p className="text-lg md:text-xl font-bold">{totalTarawih} <span className="text-[10px] font-normal opacity-70">Malam</span></p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-2.5 md:p-3 flex items-center gap-3 min-w-30 flex-1 md:flex-none">
              <div className={`p-2 rounded-full ${maxStreak > 2 ? "bg-orange-500/20" : "bg-gray-500/20"}`}>
                <Flame size={18} className={maxStreak > 2 ? "text-orange-400 fill-orange-400 animate-pulse" : "text-gray-400"} />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-violet-200 uppercase tracking-wider">Rekor</p>
                <p className="text-lg md:text-xl font-bold">{maxStreak} <span className="text-[10px] font-normal opacity-70">x Streak</span></p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-5 border border-white/10 max-w-2xl">
            <p className="text-lg md:text-xl font-serif text-right mb-2 leading-loose text-yellow-100">
              مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ
            </p>
            <p className="text-[10px] md:text-xs text-violet-100 italic leading-relaxed">
              "Barangsiapa mendirikan shalat malam di bulan Ramadhan karena iman dan mengharap pahala dari Allah, niscaya diampuni dosa-dosanya yang telah lalu."
              <span className="font-bold not-italic ml-1 text-white block md:inline md:ml-1 mt-1 md:mt-0">(HR. Bukhari & Muslim)</span>
            </p>
          </div>
        </div>
      </div>

      {/* LIST HARI */}
      <div className="space-y-3">
        {days.map((item) => (
          <TarawihItem
            key={item.day}
            day={item.day}
            dateDisplay={item.dateDisplay}
            dateValue={item.dateValue}
            initialLocation={item.location}
            isLocked={item.isLocked}
          />
        ))}
      </div>

    </div>
  )
}