// src/app/(dashboard)/tadarus/page.tsx
import { createClient } from "@/lib/supabase/server"
import { JUZ_DATA } from "@/lib/juz-data"
import { SURAH_DATA } from "@/lib/surah-data"
import JuzItem from "@/components/features/tadarus/JuzItem"
import TargetCard from "@/components/features/tadarus/TargetCard" 
import ResetButton from "@/components/features/tadarus/ResetButton" 
import RestartButton from "@/components/features/tadarus/RestartButton"
import KhatamPopup from "@/components/features/tadarus/KhatamPopup"
import { 
    getCurrentRamadhanDay, 
    RAMADHAN_DAYS_TOTAL 
} from "@/lib/ramadhan-time"
import { BookOpen, Trophy, Calendar, Moon, Star } from "lucide-react"

// --- Helper Waktu WIB ---
function getWIBDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000)); // UTC + 7 Jam
}

// --- KAMUS DATA: Jumlah ayat dari Surah 1 hingga 114 untuk akurasi mutlak ---
const SURAH_VERSE_COUNTS = [
  0, // Index 0 kosong agar index 1 = Al-Fatihah
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6
];

export default async function TadarusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil progress saat ini
  const { data: progress } = await supabase
    .from('quran_progress')
    .select('*')
    .eq('user_id', user?.id)

  // 2. Ambil Settings (Target & Riwayat Khatam)
  const { data: settings } = await supabase
    .from('user_settings')
    .select('khatam_target, total_khatam_count') 
    .eq('user_id', user?.id)
    .single()

  const khatamTarget = settings?.khatam_target || 1 
  const historyKhatam = settings?.total_khatam_count || 0

  // 3. HITUNG JUMLAH JUZ SELESAI HARI INI
  const nowWIB = getWIBDate();
  const todayISO = nowWIB.toISOString().split('T')[0] 
  
  const juzCompletedToday = progress?.filter(p => {
    if (!p.completion_count || p.completion_count < 1) return false
    if (!p.last_read_at) return false
    
    const dbDate = new Date(p.last_read_at);
    const dbUtc = dbDate.getTime() + (dbDate.getTimezoneOffset() * 60000);
    const dbWib = new Date(dbUtc + (7 * 3600000));
    const completedDateISO = dbWib.toISOString().split('T')[0];
    
    return completedDateISO === todayISO
  }).length || 0

  // 4. HITUNG TOTAL GLOBAL & LOGIKA KHATAM
  const currentProgressCount = progress?.filter(p => p.completion_count > 0).length || 0
  const totalReadGlobal = (historyKhatam * 30) + currentProgressCount

  // --- LOGIKA POPUP: Muncul jika sudah baca 30 Juz (atau lebih) ---
  const isKhatamCurrentPeriod = currentProgressCount >= 30;

  // 5. WIDGET TANGGAL
  const currentRamadhanDay = getCurrentRamadhanDay()
  const safeDay = Math.max(1, Math.min(currentRamadhanDay, RAMADHAN_DAYS_TOTAL))
  
  const masehiDate = nowWIB.toLocaleDateString("id-ID", {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
  const hijriDate = `${safeDay} Ramadhan`

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* --- 2. KOMPONEN POPUP DIPASANG DI SINI --- */}
      <KhatamPopup 
         isOpen={isKhatamCurrentPeriod} 
         khatamCountNext={historyKhatam} 
      />

      {/* HEADER DASHBOARD */}
      <div className="bg-linear-to-br from-sky-500 to-blue-900 rounded-2xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col">
        <div className="absolute -bottom-10 right-0 opacity-10 pointer-events-none">
            <BookOpen size={240} />
        </div>
        <div className="absolute top-10 right-20 opacity-20 pointer-events-none animate-pulse">
            <Star size={40} />
        </div>
        
        <div className="flex justify-end w-full mb-4 md:mb-0 md:absolute md:top-6 md:right-6 z-20">
             <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/10 flex items-center gap-2 shadow-sm">
                 <Calendar size={12} className="text-sky-100" />
                 <span>{masehiDate}</span>
                 <span className="text-white/20">|</span>
                 <Moon size={12} className="text-yellow-300 fill-yellow-300" />
                 <span className="font-bold text-yellow-100">{hijriDate}</span>
             </div>
        </div>

        <div className="relative z-10">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
                    <BookOpen className="text-sky-200 fill-sky-200/20 shrink-0" /> Sukses Tadarus
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sky-100 text-xs md:text-sm">
                   <p>Raih pahala berlipat ganda dengan membaca Al-Qur'an.</p>
                </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-5 border border-white/10 max-w-2xl">
                <p className="text-lg md:text-2xl font-serif text-right mb-2 leading-loose text-yellow-100">
                    مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا لَا أَقُولُ الم حَرْفٌ وَلَكِنْ أَلِفٌ حَرْفٌ وَلَامٌ حَرْفٌ وَمِيمٌ حَرْفٌ
                </p>
                <p className="text-[10px] md:text-sm text-sky-50 italic leading-relaxed">
                   “Barangsiapa yang membaca satu huruf dari kitab Allah (Al Qur’an), maka ia akan mendapatkan satu kebaikan dengan huruf itu, dan satu kebaikan akan dilipatgandakan menjadi sepuluh...”
                    <span className="font-bold not-italic ml-1 text-white block md:inline md:ml-1 mt-1 md:mt-0">(HR. Tirmidzi)</span>
                </p>
            </div>
        </div>
      </div>

      {/* Target Card */}
      <TargetCard 
        currentTarget={khatamTarget} 
        juzCompletedToday={juzCompletedToday}
        totalReadGlobal={totalReadGlobal} 
        khatamCount={historyKhatam} 
      />

      {/* Grid 30 Juz */}
      <div>
         <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
             <BookOpen size={20} className="text-sky-600" /> Daftar Juz
         </h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           {JUZ_DATA.map((juz) => {
               const logData = progress?.find(p => p.juz_number === juz.id)
               const isDone = (logData?.completion_count || 0) > 0
               
               let lastReadInfo = null;
               let calculatedProgress = undefined;
               
               if (!isDone && logData?.last_read_surah && logData?.last_read_ayah) {
                   const surahName = SURAH_DATA.find(s => s.number === logData.last_read_surah)?.name
                   if (surahName) {
                       lastReadInfo = {
                           surah: surahName,
                           surahNumber: logData.last_read_surah, 
                           ayah: logData.last_read_ayah
                       }

                       // --- LOGIKA HITUNG PERSENTASE PRESISI TINGGI ---
                       const totalAyahInJuz = (juz as any).totalVerses || 145; 
                       const startSurah = (juz as any).startSurah || 1;
                       const startAyah = (juz as any).startAyah || 1;
                       
                       const currentSurah = logData.last_read_surah;
                       const currentAyah = logData.last_read_ayah;
                       
                       let ayatRead = 0;

                       if (currentSurah === startSurah) {
                           // Jika masih di surah pembuka Juz
                           ayatRead = (currentAyah - startAyah) + 1;
                       } else if (currentSurah > startSurah) {
                           // 1. Tambahkan sisa ayat dari surah pertama di juz tersebut
                           ayatRead += (SURAH_VERSE_COUNTS[startSurah] - startAyah) + 1;
                           
                           // 2. Tambahkan seluruh ayat dari surah-surah di tengah (jika ada)
                           for (let s = startSurah + 1; s < currentSurah; s++) {
                               ayatRead += SURAH_VERSE_COUNTS[s];
                           }
                           
                           // 3. Tambahkan jumlah ayat yang sudah dibaca di surah saat ini
                           ayatRead += currentAyah;
                       }
                       
                       let percent = (ayatRead / totalAyahInJuz) * 100;
                       
                       if (percent > 99) percent = 99; // Dibatasi maksimal 99% agar tidak terlihat selesai
                       if (percent < 1 && ayatRead > 0) percent = 1; // Minimal 1% jika sudah mulai membaca
                       if (ayatRead <= 0) percent = 0;
                       
                       calculatedProgress = percent;
                   }
               }

               return (
                   <JuzItem 
                       key={juz.id}
                       juzNumber={juz.id}
                       title={juz.name}
                       desc={juz.desc}
                       isCompleted={isDone}
                       lastRead={lastReadInfo}
                       progressPercent={calculatedProgress} // Mengirim persentase ke komponen
                   />
               )
           })}
         </div>
      </div>

      {/* Footer Area */}
      <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <RestartButton />
              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              <ResetButton />
          </div>
          <p className="text-center text-xs text-gray-400 mt-4 max-w-md mx-auto">
              *Gunakan "Ulangi Putaran" untuk mereset checklist Juz yang telah dibaca dalam satu siklus. Gunakan "Reset Data" untuk menghapus permanen semua riwayat khatam.
          </p>
      </div>

    </div>
  )
}