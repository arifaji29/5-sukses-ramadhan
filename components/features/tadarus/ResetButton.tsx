'use client'

import { resetUserData } from "@/app/(dashboard)/tadarus/actions"
import { Trash2, Loader2, RotateCcw } from "lucide-react"
import { useTransition } from "react"

export default function ResetButton() {
  const [isPending, startTransition] = useTransition()

  const handleReset = () => {
    // KONFIRMASI GANDA AGAR TIDAK SALAH PENCET
    const confirm1 = window.confirm("⚠️ PERINGATAN: Apakah Anda yakin ingin MERESET SEMUA data tadarus?")
    if (!confirm1) return

    const confirm2 = window.confirm("Data yang dihapus tidak bisa dikembalikan. Yakin 100%?")
    if (!confirm2) return

    startTransition(async () => {
      await resetUserData()
      alert("Data berhasil direset menjadi 0.")
    })
  }

  return (
    <button
      onClick={handleReset}
      disabled={isPending}
      className="flex items-center gap-2 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
      title="Reset semua progress menjadi 0"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
      Reset Data/Mulai Baru
    </button>
  )
}