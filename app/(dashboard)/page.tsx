import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Sun, Moon, BookOpen, Star, CheckCircle, Trophy, ArrowRight, Zap, Calendar, Medal, User, Edit2, AlertTriangle, Clock } from "lucide-react"

// Import variabel krusial dari ramadhan-time
import { 
    getCurrentRamadhanDay, 
    RAMADHAN_DAYS_TOTAL,
    HIJRI_OFFSET,
    RAMADHAN_START_DATE_STR
} from "@/lib/ramadhan-time"

// Import Komponen CTA Rekap
import RekapAmalCTA from "@/components/features/dashboard/RekapAmalCTA" 

// --- Helper Waktu WIB ---
function getWIBDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000)); // UTC + 7 Jam
}

// --- Helper Tanggal Hijriah Dinamis (Dengan Offset Sidang Isbat) ---
function getHijriDetails() {
    const targetDate = getWIBDate();
    
    // Logika Maghrib (Jam 18:00 ke atas sudah ganti hari Hijriah)
    if (targetDate.getHours() >= 18) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    // APLIKASIKAN KOREKSI HARI DARI SIDANG ISBAT
    targetDate.setDate(targetDate.getDate() + HIJRI_OFFSET);

    const formatter = new Intl.DateTimeFormat('id-TN-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    
    const parts = formatter.formatToParts(targetDate);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const month = parts.find(p => p.type === 'month')?.value || '';
    const year = parts.find(p => p.type === 'year')?.value || '1447';

    return { day, month, year };
}

// --- Helper Hitung Mundur Ramadhan Tahun Depan Otomatis ---
function getNextRamadhanCountdownObj() {
    const nowWIB = getWIBDate();
    const currentRamadhanStart = new Date(RAMADHAN_START_DATE_STR);
    
    // Kalender Hijriah rata-rata berumur 354 hari per tahun. 
    // Kita tambahkan 354 hari ke tanggal mulai Ramadhan saat ini.
    const nextRamadhanDate = new Date(currentRamadhanStart.getTime() + (354 * 24 * 60 * 60 * 1000)); 
    const diffTime = nextRamadhanDate.getTime() - nowWIB.getTime();
    
    if (diffTime <= 0) return { days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
}

// --- 1. DEFINISI WARNA ---
const COLOR_MAP = {
    orange: { text: "text-orange-500", bg: "bg-orange-500", soft: "bg-orange-500/10" },
    violet: { text: "text-violet-500", bg: "bg-violet-500", soft: "bg-violet-500/10" },
    blue:   { text: "text-blue-500",   bg: "bg-blue-500",   soft: "bg-blue-500/10" },
    yellow: { text: "text-yellow-500", bg: "bg-yellow-500", soft: "bg-yellow-500/10" },
    green:  { text: "text-green-600",  bg: "bg-green-600",  soft: "bg-green-600/10" },
};

type ColorTheme = keyof typeof COLOR_MAP;

function ProgressCard({ 
    href, title, icon: Icon, theme, 
    progressValue, progressMax, progressLabel, 
    points, delay, extraBadge 
}: { 
    href: string, title: string, icon: any, theme: ColorTheme, 
    progressValue: number, progressMax: number, progressLabel: string,
    points: number, delay: string, extraBadge?: React.ReactNode 
}) {
    const percent = Math.min(100, Math.round((progressValue / progressMax) * 100)) || 0
    const colors = COLOR_MAP[theme];

    return (
        <Link 
            href={href} 
            className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full"
            style={{ animationDelay: delay }}
        >
            <div className={`absolute top-0 right-0 p-16 opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${colors.bg}`} />
            
            <div className="relative z-10 w-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.text} ${colors.soft}`}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {extraBadge}
                        <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm h-fit">
                            <Zap size={12} className="fill-yellow-500 text-yellow-500" />
                            {points}
                        </div>
                    </div>
                </div>

                <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">{title}</h3>
                
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Progress</span>
                        <span className="text-gray-900">{progressLabel}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
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

  const isAnonymous = user?.is_anonymous || false

  const { data: profile } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
  const { data: puasaData } = await supabase.from('puasa_progress').select('is_fasting').eq('user_id', user.id).eq('is_fasting', true)
  const { data: tarawihData } = await supabase.from('tarawih_progress').select('location').eq('user_id', user.id)
  const { data: quranData } = await supabase.from('quran_progress').select('completion_count').eq('user_id', user.id)
  const { data: userSettings } = await supabase.from('user_settings').select('total_khatam_count').eq('user_id', user.id).single()
  const { data: itikafData } = await supabase.from('lailatul_qadar_progress').select('night_number, is_itikaf').eq('user_id', user.id).eq('is_itikaf', true)
  const { data: zakatData } = await supabase.from('zakat_fitrah_progress').select('is_paid').eq('user_id', user.id).single()

  const puasaCount = puasaData?.length || 0
  const puasaPoints = puasaCount * 3

  let tarawihPoints = 0
  const tarawihCount = tarawihData?.length || 0
  tarawihData?.forEach((t) => {
      const lokasi = t.location ? t.location.toLowerCase() : ''
      tarawihPoints += (lokasi === 'masjid' ? 2 : 1)
  })

  const juzCompletedCount = quranData?.filter(q => q.completion_count > 0).length || 0
  const khatamCount = userSettings?.total_khatam_count || 0
  const tadarusPoints = (khatamCount * 153) + (juzCompletedCount * 5);

  let itikafPoints = 0
  const itikafCount = itikafData?.length || 0
  itikafData?.forEach((i) => {
      const isOdd = i.night_number % 2 !== 0
      itikafPoints += (isOdd ? 4 : 2)
  })
  // 👈 LOGIKA BARU: Hitung maksimal malam Lailatul Qadar secara dinamis (9 atau 10 malam)
  const itikafMaxNights = Math.max(1, RAMADHAN_DAYS_TOTAL - 20);

  const isZakatPaid = zakatData?.is_paid || false
  const zakatPoints = isZakatPaid ? 30 : 0

  const totalGlobalPoints = puasaPoints + tarawihPoints + tadarusPoints + itikafPoints + zakatPoints
  
  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || "Hamba Allah"
  const avatarUrl = profile?.avatar_url

  // --- 3. LOGIKA TANGGAL & STATUS RAMADHAN DINAMIS ---
  const nowWIB = getWIBDate();
  const hijri = getHijriDetails(); 
  
  const masehiDate = nowWIB.toLocaleDateString("id-ID", {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
  
  const monthName = hijri.month.toLowerCase();
  const isRamadhan = monthName.includes('ramadan') || monthName.includes('ramadhan');
  const isSyawal = monthName.includes('syawal');
  
  const isEidPeriod = isSyawal && hijri.day <= 15; 
  const isPostEid = !isRamadhan && !isEidPeriod;   
  const isRamadhanOver = !isRamadhan;              

  const hijriDate = `${hijri.day} ${hijri.month}`
  const nextRamadhanYear = parseInt(hijri.year) + 1; 
  const countdown = getNextRamadhanCountdownObj();

  // --- 4. LOGIKA PESAN BERDASARKAN WAKTU & STATUS ---
  let timeBasedMessage = "";
  const hour = nowWIB.getHours();

  if (isEidPeriod) {
      timeBasedMessage = "Terima kasih telah menemani perjalanan ibadah Ramadhan bersama kami. Semoga Allah menerima amal kita, dan mempertemukan kita kembali dengan Ramadhan yang akan datang.";
  } else if (isPostEid) {
      timeBasedMessage = "Jaga konsistensi ibadah dan tetap istiqomah seperti di bulan Ramadhan ya!";
  } else {
      const safeDay = Math.max(1, Math.min(hijri.day, RAMADHAN_DAYS_TOTAL));
      if (hour >= 16 && hour < 20) {
          timeBasedMessage = "Waktunya berbuka! Jangan lupa centang puasa harianmu hari ini untuk klaim 3 poin ya!";
      } else if (hour >= 20 && hour < 22) {
          timeBasedMessage = "Habis Isya jangan langsung rebahan! Yuk kejar 2 poin dengan sholat Tarawih berjamaah. ";
      } else if (hour >= 22 || hour < 5) {
          timeBasedMessage = "Malam yang tenang adalah waktu terbaik bersama Al-Qur'an. Yuk selesaikan 1 Juz dan dapatkan 5 poin! ";
      } else if (hour >= 5 && hour < 10) {
          timeBasedMessage = "Pagi yang cerah! Jadikan harimu lebih berkah dengan tadarus. Kejar bonus 153 poin dengan Khatam Al-Qur'an! ";
      } else if (hour >= 10 && hour < 13) {
          if (safeDay < 21) {
              const daysLeft = 21 - safeDay;
              timeBasedMessage = `Jangan sampai terlewat! Malam Lailatul Qadar tinggal ${daysLeft} hari lagi lho! Yuk persiapkan diri. `;
          } else {
              timeBasedMessage = "Nanti malam jangan lupa ada Lailatul Qadar! Gas poll I'tikaf: dapat 4 poin di malam ganjil dan 2 poin di malam genap! ";
          }
      } else if (hour >= 13 && hour < 16) {
          if (isZakatPaid) {
              timeBasedMessage = "Alhamdulillah kamu sudah membayar zakat dan menyelesaikan 1 dari 5 Sukses Ramadhan! Terus semangat ya! ";
          } else {
              timeBasedMessage = "Udah bayar zakat belum nih? Yuk segera tunaikan Zakat Fitrah sebelum waktunya habis! ";
          }
      }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* SECTION 1: WELCOME BANNER */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none">
            <Star size={300} />
         </div>

         <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                 
                 <div className="inline-flex backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium border items-center gap-2 shadow-sm h-fit mt-1 bg-white/10 border-white/10">
                     <Calendar size={12} className="text-emerald-200" />
                     <span>{masehiDate}</span>
                     <span className="text-white/20">|</span>
                     <Moon size={12} className="text-yellow-300 fill-yellow-300" />
                     <span className="font-bold text-yellow-100">{hijriDate}</span>
                 </div>

                 <Link href="/profile" className="group flex flex-col items-center gap-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:scale-105 relative border-white/30 bg-white/10">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-white/80" />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={16} className="text-white" />
                        </div>
                    </div>
                    <span className="text-[9px] md:text-[10px] text-emerald-100 font-medium opacity-80 group-hover:opacity-100 group-hover:text-white transition-colors">
                        Edit Profil
                    </span>
                 </Link>

             </div>

             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 <div className="max-w-lg">
                    {isEidPeriod ? (
                        <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2 drop-shadow-md leading-snug">
                            Selamat Hari Raya Idul Fitri {hijri.year} H. <span className="text-yellow-300 drop-shadow-sm">{displayName}</span>
                        </h2>
                    ) : (
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            Assalamu'alaikum, <span className="text-yellow-300 drop-shadow-sm">{displayName}!</span>
                        </h1>
                    )}
                    
                    <p className={`text-sm leading-relaxed min-h-10 ${isRamadhanOver ? 'text-emerald-50 opacity-95' : 'text-emerald-100'}`}>
                        {timeBasedMessage}
                    </p>

                    {!isRamadhan && (
                        <div className="mt-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 inline-block shadow-lg">
                            <div className="text-[11px] text-yellow-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Clock size={14} className="text-yellow-300"/> Menuju Ramadhan {nextRamadhanYear} H
                            </div>
                            <div className="flex gap-3 text-center">
                                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 min-w-16.25 shadow-inner">
                                    <div className="text-2xl font-black text-white leading-none mb-1">{countdown.days}</div>
                                    <div className="text-[9px] text-emerald-200 font-bold uppercase">HARI</div>
                                </div>
                                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 min-w-16.25 shadow-inner">
                                    <div className="text-2xl font-black text-white leading-none mb-1">{countdown.hours}</div>
                                    <div className="text-[9px] text-emerald-200 font-bold uppercase">JAM</div>
                                </div>
                                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 min-w-16.25 shadow-inner">
                                    <div className="text-2xl font-black text-white leading-none mb-1">{countdown.minutes}</div>
                                    <div className="text-[9px] text-emerald-200 font-bold uppercase">MENIT</div>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>

                 <Link 
                    href="/leaderboard" 
                    className="group backdrop-blur-md border rounded-2xl p-4 min-w-37.5 text-center self-end md:self-auto shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center mt-4 md:mt-0 hover:scale-105 bg-white/10 border-white/20 hover:bg-white/20"
                 >
                    <div className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Total Poin</div>
                    <div className="text-4xl font-extrabold text-yellow-300 drop-shadow-sm flex items-center justify-center gap-2 mb-1">
                        <Trophy size={28} className="text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                        {totalGlobalPoints}
                    </div>
                    <div className="text-[10px] text-emerald-100 font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity mt-1">
                        Lihat Peringkat <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                 </Link>
             </div>
         </div>
      </div>

      <RekapAmalCTA show={isRamadhanOver} />

      {isAnonymous && (
        <Link 
            href="/profile" 
            className="group flex flex-col md:flex-row items-start md:items-center gap-4 bg-orange-50 border border-orange-200 p-4 rounded-2xl hover:bg-orange-100 transition-colors shadow-sm cursor-pointer"
        >
            <div className="bg-orange-100 p-2.5 rounded-full text-orange-600 group-hover:bg-orange-200 transition-colors shrink-0">
                <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-orange-800 text-sm md:text-base">Perhatian: Kamu Masuk Sebagai Akun Guest</h3>
                <p className="text-xs md:text-sm text-orange-700 mt-1 leading-relaxed">
                Segera lengkapi akun agar riwayat poinmu tidak hilang saat keluar aplikasi.
                </p>
            </div>
            <div className="shrink-0 text-sm font-bold text-orange-600 group-hover:text-orange-800 flex items-center gap-1 transition-colors mt-2 md:mt-0">
                Lengkapi Sekarang <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-500 rounded-full"/>
            Progress Ibadah Kamu
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <ProgressCard 
                href="/puasa" title="1. Sukses Puasa" icon={Sun} theme="orange"
                progressValue={puasaCount} progressMax={RAMADHAN_DAYS_TOTAL} progressLabel={`${puasaCount} / ${RAMADHAN_DAYS_TOTAL} Hari`} points={puasaPoints} delay="0ms"
            />
             <ProgressCard 
                href="/tarawih" title="2. Sukses Tarawih" icon={Moon} theme="violet" 
                progressValue={tarawihCount} progressMax={RAMADHAN_DAYS_TOTAL} progressLabel={`${tarawihCount} / ${RAMADHAN_DAYS_TOTAL} Malam`} points={tarawihPoints} delay="100ms"
            />
             <ProgressCard 
                href="/tadarus" title="3. Sukses Tadarus" icon={BookOpen} theme="blue" 
                progressValue={juzCompletedCount} progressMax={30} progressLabel={`${juzCompletedCount} / 30 Juz`} points={tadarusPoints} delay="200ms"
                extraBadge={khatamCount > 0 ? (
                    <div className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm h-fit">
                        <Medal size={12} /> {khatamCount}x Khatam
                    </div>
                ) : null}
            />
             {/* 👈 PERBAIKAN: Menggunakan itikafMaxNights */}
             <ProgressCard 
                href="/lailatul-qadar" title="4. Lailatul Qadar" icon={Star} theme="yellow" 
                progressValue={itikafCount} progressMax={itikafMaxNights} progressLabel={`${itikafCount} / ${itikafMaxNights} Malam`} points={itikafPoints} delay="300ms"
            />
             <ProgressCard 
                href="/zakat" title="5. Sukses Zakat" icon={CheckCircle} theme="green" 
                progressValue={isZakatPaid ? 1 : 0} progressMax={1} progressLabel={isZakatPaid ? "Sudah Bayar" : "Belum Bayar"} points={zakatPoints} delay="400ms"
            />
        </div>
      </div>
    </div>
  )
}