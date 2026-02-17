'use client'

import { devToolUpdate } from "@/app/(dashboard)/tadarus/actions"
import { Settings, Save, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const [khatam, setKhatam] = useState(0)
  const [juz, setJuz] = useState(0)
  const [isPending, startTransition] = useTransition()

  const handleApply = () => {
    startTransition(async () => {
      await devToolUpdate(khatam, juz)
      setIsOpen(false)
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Tombol Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all active:scale-95"
        title="Menu Developer (Testing)"
      >
        <Settings size={20} className={isOpen ? "rotate-90 transition-transform" : ""} />
      </button>

      {/* Panel Menu */}
      {isOpen && (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 mt-2 mb-16 w-64 animate-in slide-in-from-bottom-5 fade-in absolute bottom-0 right-0">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            🛠️ Developer Tools
          </h3>
          
          <div className="space-y-3">
            {/* Input Khatam */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Set Total Khatam</label>
              <input 
                type="number" 
                min="0"
                value={khatam}
                onChange={(e) => setKhatam(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Input Juz */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Set Juz Selesai (1-{juz})</label>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={juz}
                onChange={(e) => setJuz(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="text-right text-xs font-bold text-emerald-600 mt-1">
                {juz} Juz
              </div>
            </div>

            {/* Tombol Apply */}
            <button 
                onClick={handleApply}
                disabled={isPending}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Terapkan Data
            </button>
            
            <p className="text-[10px] text-gray-400 text-center mt-2 leading-tight">
              *Fitur ini akan menimpa data progress saat ini. Hanya untuk testing.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}