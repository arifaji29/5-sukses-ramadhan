import Link from "next/link"
import { ArrowLeft, PlayCircle } from "lucide-react"

// Tipe data untuk response API EQuran.id
interface Ayat {
  nomorAyat: number
  teksArab: string
  teksLatin: string
  teksIndonesia: string
  audio: {
    "01": string // Kita pakai audio qori pertama (Abdullah Al-Juhany)
  }
}

interface SuratDetail {
  nomor: number
  namaLatin: string
  nama: string
  arti: string
  jumlahAyat: number
  ayat: Ayat[]
}

// Function untuk ambil data dari API (Fetch Data)
async function getSurat(nomor: string): Promise<SuratDetail | null> {
  try {
    const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`, {
      next: { revalidate: 3600 } // Cache data selama 1 jam biar cepat
    })
    
    if (!res.ok) return null

    const data = await res.json()
    return data.data // EQuran membungkus datanya di property 'data'
  } catch (error) {
    console.error("Gagal ambil surat:", error)
    return null
  }
}

export default async function BacaSuratPage({ params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params;
  const surat = await getSurat(nomor)

  if (!surat) {
    return <div className="p-8 text-center">Surat tidak ditemukan atau gagal memuat.</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      
      {/* Header Surat */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/tadarus" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">{surat.namaLatin} ({surat.nama})</h1>
            <p className="text-sm text-gray-500">{surat.arti} • {surat.jumlahAyat} Ayat</p>
          </div>
        </div>
      </div>

      {/* Daftar Ayat */}
      <div className="space-y-6">
        {/* Bismillah (Kecuali At-Taubah / Surat 9) */}
        {parseInt(nomor) !== 9 && (
            <div className="text-center py-8">
                <h2 className="text-3xl font-amiri leading-loose text-gray-800">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                </h2>
            </div>
        )}

        {surat.ayat.map((ayat) => (
          <div key={ayat.nomorAyat} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            
            {/* Header Ayat (Nomor & Audio) */}
            <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-lg">
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold rounded-full text-sm">
                {ayat.nomorAyat}
              </span>
              
              {/* Audio Player Native */}
              <audio controls className="h-8 w-48 opacity-80" preload="none">
                <source src={ayat.audio["01"]} type="audio/mpeg" />
              </audio>
            </div>

            {/* Teks Arab */}
            <div className="text-right mb-6">
              <p className="text-3xl font-amiri leading-[2.5] text-gray-900" dir="rtl">
                {ayat.teksArab}
              </p>
            </div>

            {/* Terjemahan */}
            <div className="space-y-2">
              <p className="text-sm text-emerald-700 font-medium italic">
                {ayat.teksLatin}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {ayat.teksIndonesia}
              </p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}