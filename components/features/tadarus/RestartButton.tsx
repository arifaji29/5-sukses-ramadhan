'use client'

import { restartCurrentRound } from "@/app/(dashboard)/tadarus/actions"
import { RefreshCcw, Loader2 } from "lucide-react"
import { useTransition } from "react"

export default function RestartButton() {
  const [isPending, startTransition] = useTransition()

  const handleRestart = () => {
    const confirm = window.confirm(
        "Apakah Anda yakin ingin MENGULANG putaran ini dari awal?\n\n" +
        "Catatan: Jumlah Khatam Anda TIDAK AKAN dihapus. Hanya status juz yang akan direset."
    )
    if (!confirm) return

    startTransition(async () => {
      await restartCurrentRound()
    })
  }

  return (
    <button
      onClick={handleRestart}
      disabled={isPending}
      className="flex items-center gap-2 text-xs font-medium text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-3 py-2 rounded-lg transition-colors"
      title="Bersihkan kartu tapi simpan total khatam"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
      Ulangi Putaran
    </button>
  )
}