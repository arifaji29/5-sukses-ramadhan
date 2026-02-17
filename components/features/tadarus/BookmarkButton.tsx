'use client'

import { saveLastRead } from "@/app/(dashboard)/tadarus/actions"
import { Bookmark, Loader2, X } from "lucide-react" // Tambah icon X
import { useTransition } from "react"

interface BookmarkButtonProps {
  juz: number
  surah: number
  ayah: number
  isLastRead: boolean
}

export default function BookmarkButton({ juz, surah, ayah, isLastRead }: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleBookmark = () => {
    startTransition(async () => {
      if (isLastRead) {
          // LOGIKA RESET: Jika sudah aktif, hapus bookmark (kirim null)
          await saveLastRead(juz, null, null) 
      } else {
          // LOGIKA SET: Jika belum, simpan bookmark
          await saveLastRead(juz, surah, ayah)
      }
    })
  }

  return (
    <button 
      onClick={handleBookmark}
      disabled={isPending}
      className={`p-2 rounded-full transition-all flex items-center gap-2 text-xs font-medium border
        ${isLastRead 
            ? "bg-emerald-600 text-white border-emerald-600 hover:bg-red-500 hover:border-red-500 shadow-md ring-2 ring-emerald-100" // Hover jadi Merah untuk indikasi Hapus
            : "bg-white text-gray-400 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
        }
      `}
      title={isLastRead ? "Hapus penanda" : "Tandai terakhir dibaca"}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isLastRead ? (
        // Tampilkan ikon X saat di-hover (bisa diatur via CSS group, tapi ikon Bookmark putih juga oke)
        // Disini kita pakai Bookmark solid
        <Bookmark size={16} className="fill-white" />
      ) : (
        <Bookmark size={16} />
      )}
      
      {/* Teks Label */}
      {isLastRead ? "Terakhir Dibaca" : "Tandai"}
    </button>
  )
}