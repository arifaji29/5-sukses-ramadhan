import Link from "next/link"
import { ArrowLeft, ChevronDown, Check } from "lucide-react"
import { SURAH_DATA } from "@/lib/surah-data" 
import { createClient } from "@/lib/supabase/server" 
import BookmarkButton from "@/components/features/tadarus/BookmarkButton" 
import FinishJuzButton from "@/components/features/tadarus/FinishJuzButton" 
import VerseAudioPlayer from "@/components/features/tadarus/VerseAudioPlayer"

interface Ayah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  juz: number;
  audio?: string;
  translation?: string;
}

// 1. Fetch Data API
async function getJuzData(id: string) {
  try {
    const resArab = await fetch(`https://api.alquran.cloud/v1/juz/${id}/ar.alafasy`, { 
        next: { revalidate: 86400 } 
    });
    
    const resIndo = await fetch(`https://api.alquran.cloud/v1/juz/${id}/id.indonesian`, { 
        next: { revalidate: 86400 } 
    });

    if (!resArab.ok || !resIndo.ok) return null;

    const dataArab = await resArab.json();
    const dataIndo = await resIndo.json();

    const mergedAyahs = dataArab.data.ayahs.map((ayah: Ayah, index: number) => ({
        ...ayah,
        translation: dataIndo.data.ayahs[index].text 
    }));

    return mergedAyahs;
  } catch (error) {
    console.error("Error fetching Juz:", error);
    return null;
  }
}

// 2. Helper: Memisahkan Bismillah (LOGIKA BARU: CARI KATA KUNCI)
const splitBismillah = (text: string, surahNumber: number, verseNumber: number) => {
    // Skip Al-Fatihah (1) & At-Taubah (9)
    if (surahNumber === 1 || surahNumber === 9 || verseNumber !== 1) {
        return { bismillah: null, content: text };
    }
    
    // STRATEGI: Cari kata terakhir dari Bismillah ("Ar-Rahim")
    // Kita cek 2 variasi penulisan umum untuk jaga-jaga
    const targets = ["ٱلرَّحِيمِ", "الرحيم"]; 
    
    for (const target of targets) {
        const index = text.indexOf(target);
        
        // Jika ketemu dan posisinya di awal kalimat (kurang dari 50 karakter)
        if (index !== -1 && index < 50) {
            const cutPoint = index + target.length;
            
            // Ambil Bismillah
            const bismillahTxt = text.substring(0, cutPoint).trim();
            // Ambil Sisanya (Ayat)
            const contentTxt = text.substring(cutPoint).trim();
            
            return {
                bismillah: bismillahTxt,
                content: contentTxt
            };
        }
    }

    // Jika gagal split, return as is
    return { bismillah: null, content: text };
}

// Helper: Angka Arab
const toArabicNum = (num: number) => {
  return num.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}

export default async function BacaJuzPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const juzId = parseInt(id);
  
  const ayahs = await getJuzData(id);

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: progress } = await supabase
    .from('quran_progress')
    .select('last_read_surah, last_read_ayah, completion_count') 
    .eq('user_id', user?.id)
    .eq('juz_number', juzId)
    .single()

  const isCompleted = (progress?.completion_count || 0) > 0;

  if (!ayahs) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <p className="text-gray-500">Gagal memuat data Juz.</p>
            <Link href="/tadarus" className="text-emerald-600 hover:underline">Kembali</Link>
        </div>
    )
  }

  const lastAyahObj = ayahs[ayahs.length - 1];
  const lastAyahData = {
      surah: lastAyahObj.surah.number,
      ayah: lastAyahObj.numberInSurah
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 pb-24"> {/* Space antar card dikurangi jadi space-y-3 */}
      
      {/* Header Sticky */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-20 flex items-center gap-4">
        <Link href="/tadarus" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
            <h1 className="text-lg font-bold text-emerald-800">Juz {id}</h1>
            <p className="text-[10px] text-gray-500">Membaca per Juz</p>
        </div>
      </div>

      <div className="px-1 space-y-3">
        {ayahs.map((ayat: Ayah) => {
            const currentSurahNum = ayat.surah.number;
            const surahIndo = SURAH_DATA.find(s => s.number === currentSurahNum);
            const showSurahHeader = ayat.numberInSurah === 1;

            const isLastRead = 
                progress?.last_read_surah === currentSurahNum && 
                progress?.last_read_ayah === ayat.numberInSurah;

            // Proses pemisahan Bismillah
            const { bismillah, content } = splitBismillah(ayat.text, currentSurahNum, ayat.numberInSurah);

            return (
                <div key={`${ayat.surah.number}-${ayat.numberInSurah}`}>
                    
                    {/* 1. HEADER SURAT */}
                    {showSurahHeader && surahIndo && (
                        <div className="mt-8 mb-4 px-1">
                            <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl p-4 shadow-md relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                                <div>
                                    <h2 className="text-lg font-bold font-serif tracking-wide">{surahIndo.name}</h2>
                                    <p className="text-[10px] text-emerald-100 uppercase tracking-widest mt-0.5 opacity-90">
                                        {surahIndo.arti} • {ayat.surah.numberOfAyahs} Ayat
                                    </p>
                                </div>

                                <div className="relative z-10 w-10 h-10 flex items-center justify-center border border-white/30 rounded-full bg-white/10 backdrop-blur-sm">
                                    <span className="font-lpmq text-xl pt-1">{toArabicNum(currentSurahNum)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. BISMILLAH (DILUAR CARD - Center) */}
                    {bismillah && (
                        <div className="text-center my-6">
                            <p className="font-lpmq text-2xl text-emerald-800 leading-normal">
                                {bismillah}
                            </p>
                        </div>
                    )}

                    {/* 3. CARD AYAT (COMPACT) */}
                    <div 
                        id={`verse-${ayat.surah.number}-${ayat.numberInSurah}`}
                        className={`p-3 rounded-xl border transition-all relative scroll-mt-32
                            ${isLastRead 
                                ? "bg-emerald-50/60 border-emerald-500 ring-1 ring-emerald-500 shadow-sm" 
                                : "bg-white border-gray-100 hover:border-emerald-200"
                            }
                        `} 
                    >
                        {/* Header Ayat: Nomor & Tools */}
                        <div className="flex justify-between items-center mb-2 bg-gray-50/50 p-1.5 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold border border-emerald-200 shadow-sm">
                                    {ayat.numberInSurah}
                                </div>
                                <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
                                    {surahIndo?.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {ayat.audio && <VerseAudioPlayer audioUrl={ayat.audio} />}
                                <BookmarkButton 
                                    juz={juzId}
                                    surah={currentSurahNum}
                                    ayah={ayat.numberInSurah}
                                    isLastRead={isLastRead}
                                />
                            </div>
                        </div>

                        {/* --- AREA TEKS ARAB (Compact Font & Leading) --- */}
                        <div className="text-right pl-1">
                            {/* Font size: text-xl md:text-2xl (Lebih kecil) */}
                            {/* Leading: leading-relaxed (Lebih rapat dari loose) */}
                            <p className="text-xl md:text-2xl font-lpmq leading-relaxed text-gray-800" dir="rtl">
                                {content}
                                <span className="font-lpmq text-emerald-600 text-xl mr-1 inline-block select-none">
                                     ۝{toArabicNum(ayat.numberInSurah)}
                                </span>
                            </p>
                        </div>

                        {/* ACCORDION TERJEMAHAN */}
                        <div className="text-left mt-2 border-t border-gray-50 pt-1">
                            <details className="group">
                                <summary className="list-none flex items-center gap-1 text-[9px] font-bold text-gray-400 cursor-pointer hover:text-emerald-600 select-none w-fit px-2 py-1 rounded transition-colors focus:outline-none">
                                    <ChevronDown size={10} className="transition-transform group-open:rotate-180" />
                                    TERJEMAHAN
                                </summary>
                                <div className="mt-1 text-gray-600 leading-relaxed text-xs pl-2 border-l-2 border-emerald-100 animate-in fade-in slide-in-from-top-1">
                                    {ayat.translation}
                                </div>
                            </details>
                        </div>

                        {isLastRead && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 whitespace-nowrap">
                                TERAKHIR DIBACA
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>

      {/* FOOTER: SELESAI JUZ */}
      <div className="pt-6 px-2">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/50 rounded-full -ml-10 -mb-10 blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 relative z-10 text-center md:text-left">
                <div>
                    <p className="text-emerald-900 font-bold text-sm">Alhamdulillah, Selesai Juz {id}!</p>
                    <p className="text-emerald-700/80 text-[10px] leading-tight max-w-50">
                        Klik tombol di samping untuk menyimpan progres.
                    </p>
                </div>
            </div>
            
            <div className="shrink-0 relative z-10">
                <FinishJuzButton 
                    juzNumber={juzId} 
                    isCompleted={isCompleted} 
                    lastAyahData={lastAyahData} 
                />
            </div>
        </div>

        {/* Navigasi Next/Prev */}
        <div className="flex justify-between items-center py-6 mt-2 border-t border-gray-50">
            {juzId > 1 ? (
                <Link href={`/tadarus/juz/${juzId - 1}`} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium transition-colors text-gray-600 shadow-sm">
                  <ArrowLeft size={14} /> Juz {juzId - 1}
                </Link>
            ) : <div />} 
            
            {juzId < 30 && (
                <Link href={`/tadarus/juz/${juzId + 1}`} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 text-xs font-medium transition-colors text-white shadow-md">
                  Juz {juzId + 1} <ArrowLeft size={14} className="rotate-180" />
                </Link>
            )}
        </div>
      </div>

    </div>
  )
}