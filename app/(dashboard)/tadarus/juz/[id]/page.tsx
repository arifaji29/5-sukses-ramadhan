import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react" // Import ChevronDown
import { SURAH_DATA } from "@/lib/surah-data" 
import { createClient } from "@/lib/supabase/server" 
import BookmarkButton from "@/components/features/tadarus/BookmarkButton" 
import FinishJuzButton from "@/components/features/tadarus/FinishJuzButton" 

interface Ayah {
  number: number;
  text: string;
  surah: {
    number: number;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  juz: number;
  audio?: string;
  translation?: string;
}

// Fetch Data API
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

// Helper: Hapus Bismillah di awal ayat 1 (Lebih Robust dengan Regex)
const formatAyatText = (text: string, surahNumber: number, verseNumber: number) => {
    // Jangan hapus Bismillah di Al-Fatihah (Surat 1)
    if (surahNumber === 1) return text; 
    
    // Regex untuk menangkap Bismillah + Spasi di awal kalimat
    const bismillahRegex = /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/;
    
    if (verseNumber === 1) {
      return text.replace(bismillahRegex, "").trim();
    }
    return text;
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
  
  // 2. AMBIL STATUS PENYELESAIAN (Completion Count)
  const { data: progress } = await supabase
    .from('quran_progress')
    .select('last_read_surah, last_read_ayah, completion_count') 
    .eq('user_id', user?.id)
    .eq('juz_number', juzId)
    .single()

  // Cek apakah sudah khatam (completion_count > 0)
  const isCompleted = (progress?.completion_count || 0) > 0;

  if (!ayahs) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <p className="text-gray-500">Gagal memuat data Juz.</p>
            <Link href="/tadarus" className="text-emerald-600 hover:underline">Kembali</Link>
        </div>
    )
  }

  // --- LOGIKA BARU: TENTUKAN AYAT TERAKHIR ---
  const lastAyahObj = ayahs[ayahs.length - 1];
  const lastAyahData = {
      surah: lastAyahObj.surah.number,
      ayah: lastAyahObj.numberInSurah
  };
  // -------------------------------------------

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header Sticky */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-20 flex items-center gap-4">
        <Link href="/tadarus" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-600" />
        </Link>
        <div>
            <h1 className="text-xl font-bold text-emerald-800">Juz {id}</h1>
            <p className="text-xs text-gray-500">Membaca per Juz</p>
        </div>
      </div>

      <div className="space-y-2">
        {ayahs.map((ayat: Ayah, index: number) => {
            const currentSurahNum = ayat.surah.number;
            const prevSurahNum = index > 0 ? ayahs[index - 1].surah.number : -1;
            const isNewSurah = currentSurahNum !== prevSurahNum;
            const surahIndo = SURAH_DATA.find(s => s.number === currentSurahNum);

            const isLastRead = 
                progress?.last_read_surah === currentSurahNum && 
                progress?.last_read_ayah === ayat.numberInSurah;

            return (
                <div key={index}>
                    {/* Header Surat Baru */}
                    {isNewSurah && surahIndo && (
                        <div className="mt-12 mb-6 text-center bg-emerald-50 py-6 rounded-xl border border-emerald-100">
                            <h2 className="text-2xl font-bold text-emerald-800 mb-1">{surahIndo.name}</h2>
                            <p className="text-sm text-emerald-600 mb-4">{surahIndo.arti} • {ayat.surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'} • {ayat.surah.numberOfAyahs} Ayat</p>
                            {/* Bismillah Header (Tampilkan untuk semua surat kecuali Taubah dan Al-Fatihah yang sudah punya di teks) */}
                            {currentSurahNum !== 9 && (
                                <p className="font-amiri text-3xl mt-2 text-emerald-900 leading-loose">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
                            )}
                        </div>
                    )}

                    {/* Card Ayat */}
                    <div 
                        className={`p-5 rounded-xl border transition-all mb-4 scroll-mt-32 relative
                            ${isLastRead 
                                ? "bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500" 
                                : "bg-white border-gray-100 hover:border-emerald-200"
                            }
                        `} 
                        // ID DEEP LINKING (Format: verse-{surah}-{ayah})
                        id={`verse-${ayat.surah.number}-${ayat.numberInSurah}`}
                    >
                        {isLastRead && (
                            <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10">
                                TERAKHIR DIBACA
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                    {surahIndo?.name} : {ayat.numberInSurah}
                                </span>
                                <BookmarkButton 
                                    juz={juzId}
                                    surah={currentSurahNum}
                                    ayah={ayat.numberInSurah}
                                    isLastRead={isLastRead}
                                />
                            </div>
                            
                            {ayat.audio && (
                                <audio controls className="h-8 w-32 md:w-48 opacity-80" preload="none">
                                    <source src={ayat.audio} type="audio/mpeg" />
                                </audio>
                            )}
                        </div>

                        {/* Teks Arab (Bersih dari Bismillah) */}
                        <div className="text-right mb-6 pl-4 leading-loose">
                            <p className="text-3xl font-amiri leading-[2.8] text-gray-900 inline" dir="rtl">
                                {formatAyatText(ayat.text, ayat.surah.number, ayat.numberInSurah)}
                                <span className="text-emerald-600 text-2xl font-amiri mr-2 select-none">
                                     &nbsp;﴿{toArabicNum(ayat.numberInSurah)}﴾
                                </span>
                            </p>
                        </div>

                        {/* FITUR BARU: ACCORDION TERJEMAHAN */}
                        <details className="group border-t border-gray-100 pt-3 mt-3">
                            <summary className="flex items-center gap-2 text-xs font-medium text-emerald-600 cursor-pointer hover:text-emerald-700 select-none w-fit transition-colors">
                                <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                                <span>Lihat Terjemahan</span>
                            </summary>
                            
                            <div className="mt-3 text-gray-600 leading-relaxed text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                                <p>{ayat.translation}</p>
                            </div>
                        </details>

                    </div>
                </div>
            )
        })}
      </div>

      {/* 3. TOMBOL SELESAI (FOOTER) */}
      <div className="pt-8 border-t border-gray-100 mt-8">
        <div className="bg-emerald-50 p-6 rounded-2xl text-center mb-6 border border-emerald-100">
            <h3 className="text-emerald-900 font-bold mb-2 text-xl">Shadaqallahul 'Adzim</h3>
            <p className="text-emerald-700 text-sm mb-6">Anda telah mencapai akhir Juz {id}.</p>
            
            {/* Kirim lastAyahData ke tombol */}
            <FinishJuzButton 
                juzNumber={juzId} 
                isCompleted={isCompleted} 
                lastAyahData={lastAyahData} 
            />
        </div>

        {/* Navigasi Next/Prev Juz */}
        <div className="flex justify-between px-2">
            {juzId > 1 ? (
                <Link href={`/tadarus/juz/${juzId - 1}`} className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                  ← Juz {juzId - 1}
                </Link>
            ) : <div />} 
            
            {juzId < 30 && (
                <Link href={`/tadarus/juz/${juzId + 1}`} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
                  Juz {juzId + 1} →
                </Link>
            )}
        </div>
      </div>

    </div>
  )
}