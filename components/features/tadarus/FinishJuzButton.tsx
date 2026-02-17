'use client'

import { toggleJuzCompletion } from "@/app/(dashboard)/tadarus/actions"
import { Check, Circle, Loader2 } from "lucide-react" // Menggunakan ikon Check yang lebih simple
import { useTransition } from "react"

interface FinishJuzButtonProps {
  juzNumber: number
  isCompleted: boolean
  lastAyahData: {
    surah: number
    ayah: number
  }
}

export default function FinishJuzButton({ juzNumber, isCompleted, lastAyahData }: FinishJuzButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleJuzCompletion(juzNumber, isCompleted, lastAyahData)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        relative overflow-hidden group flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300
        ${isCompleted 
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200" 
            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        }
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      {isPending ? (
        <>
            <Loader2 size={16} className="animate-spin" />
            <span>Memproses...</span>
        </>
      ) : isCompleted ? (
        <>
            <div className="bg-emerald-600 rounded-full p-0.5">
                <Check size={12} className="text-white" strokeWidth={3} />
            </div>
            <span>Sudah Selesai</span>
        </>
      ) : (
        <>
            <Circle size={16} className="opacity-50" />
            <span>Tandai Selesai</span>
        </>
      )}
    </button>
  )
}