'use client'

import { toggleJuzCompletion } from "@/app/(dashboard)/tadarus/actions"
import { CheckCircle, Circle, Loader2 } from "lucide-react"
import { useTransition } from "react"

interface FinishJuzButtonProps {
  juzNumber: number
  isCompleted: boolean
  // Props Baru: Data Ayat Terakhir di Juz ini
  lastAyahData: {
    surah: number
    ayah: number
  }
}

export default function FinishJuzButton({ juzNumber, isCompleted, lastAyahData }: FinishJuzButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      // Kirim data lastAyahData ke server action
      await toggleJuzCompletion(juzNumber, isCompleted, lastAyahData)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-md
        ${isCompleted 
            ? "bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50" 
            : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
        }
      `}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : isCompleted ? (
        <>
            <CheckCircle className="fill-emerald-100" />
            <span>Alhamdulillah Selesai (Batalkan)</span>
        </>
      ) : (
        <>
            <Circle className="text-emerald-200" />
            <span>Tandai Selesai Juz {juzNumber}</span>
        </>
      )}
    </button>
  )
}