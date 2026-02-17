import { createClient } from "@/lib/supabase/server"
import { JUZ_DATA } from "@/lib/juz-data" // Pastikan file ini ada
import { SURAH_DATA } from "@/lib/surah-data" // Pastikan file ini ada
import JuzItem from "@/components/features/tadarus/JuzItem"
import TargetCard from "@/components/features/tadarus/TargetCard" 
import ResetButton from "@/components/features/tadarus/ResetButton" 
import RestartButton from "@/components/features/tadarus/RestartButton"
import { 
    RAMADHAN_START_DATE_STR, 
    getCurrentRamadhanDay, 
    RAMADHAN_DAYS_TOTAL 
} from "@/lib/ramadhan-time"
import { BookOpen, Trophy, Calendar, Moon } from "lucide-react"

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

  // 3. HITUNG JUMLAH JUZ SELESAI HARI INI (Untuk Misi Harian)
  const today = new Date().toISOString().split('T')[0] 
  
  const juzCompletedToday = progress?.filter(p => {
    // Syarat: Sudah selesai (count > 0) DAN waktu update terakhir adalah hari ini
    if (!p.completion_count || p.completion_count < 1) return false
    if (!p.last_read_at) return false
    
    const completedDate = new Date(p.last_read_at).toISOString().split('T')[0]
    return completedDate === today
  }).length || 0

  // 4. HITUNG TOTAL GLOBAL (Riwayat Khatam + Progress Saat Ini)
  const currentProgressCount = progress?.filter(p => p.completion_count > 0).length || 0
  const totalReadGlobal = (historyKhatam * 30) + currentProgressCount

  // 5. WIDGET TANGGAL & WAKTU
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* 1. HEADER DASHBOARD (Tema Biru + Hadits + Tanggal) */}
      <div className="bg-linear-to-br from-sky-500 to-blue-900 rounded-2xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col">
        
        {/* Hiasan Background */}
        <div className="absolute -bottom-10 right-0 opacity-10 pointer-events-none">
            <BookOpen size={240} />
        </div>
        
        {/* WIDGET TANGGAL COMPACT (Pojok Kanan Atas) */}
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
                   <p>Raih pahala berlipat ganda dengan Al-Qur'an.</p>
                   {/* Badge Riwayat Khatam Kecil */}
                   {historyKhatam > 0 && (
                       <span className="bg-yellow-400/20 text-yellow-100 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-400/30 flex items-center gap-1">
                          <Trophy size={10} /> {historyKhatam}x Khatam
                       </span>
                   )}
                </div>
            </div>

            {/* HADITS TENTANG AL-QURAN */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-5 border border-white/10 max-w-2xl">
                <p className="text-lg md:text-2xl font-serif text-right mb-2 leading-loose text-yellow-100">
                   مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالحَسَنَةُ بِعَشْرِ أَمْثَالِهَا
                </p>
                <p className="text-[10px] md:text-sm text-sky-50 italic leading-relaxed">
                    "Barangsiapa yang membaca satu huruf dari Kitab Allah, maka dia akan mendapatkan satu kebaikan, dan satu kebaikan itu akan dilipatgandakan menjadi sepuluh kebaikan."
                    <span className="font-bold not-italic ml-1 text-white block md:inline md:ml-1 mt-1 md:mt-0">(HR. Tirmidzi)</span>
                </p>
            </div>
        </div>
      </div>

      {/* 2. Kartu Target (Warna & Logika Baru) */}
      <TargetCard 
        currentTarget={khatamTarget} 
        juzCompletedToday={juzCompletedToday}
        totalReadGlobal={totalReadGlobal} 
      />

      {/* 3. Grid 30 Juz */}
      <div>
         <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
             <BookOpen size={20} className="text-sky-600" /> Daftar Juz
         </h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           {JUZ_DATA.map((juz) => {
               const logData = progress?.find(p => p.juz_number === juz.id)
               const isDone = (logData?.completion_count || 0) > 0
               
               let lastReadInfo = null;
               if (!isDone && logData?.last_read_surah && logData?.last_read_ayah) {
                   const surahName = SURAH_DATA.find(s => s.number === logData.last_read_surah)?.name
                   
                   if (surahName) {
                       lastReadInfo = {
                           surah: surahName,
                           surahNumber: logData.last_read_surah, 
                           ayah: logData.last_read_ayah
                       }
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
                   />
               )
           })}
         </div>
      </div>

      {/* 4. Footer Area (Tombol Pengaturan) */}
      <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <RestartButton />
              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              <ResetButton />
          </div>
          <p className="text-center text-xs text-gray-400 mt-4 max-w-md mx-auto">
             *Gunakan "Ulangi Putaran" untuk mereset checklist juz saat khatam. Gunakan "Reset Data" untuk menghapus permanen semua riwayat.
          </p>
      </div>

    </div>
  )
}