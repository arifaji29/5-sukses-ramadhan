'use client'

import { updateTarawihLocation } from "@/app/(dashboard)/tarawih/actions"
import { useTransition } from "react"
import { Home, Moon, Lock } from "lucide-react"

interface TarawihItemProps {
    day: number
    dateDisplay: string
    dateValue: string
    initialLocation: string | null
    isLocked: boolean // Prop baru
}

export default function TarawihItem({ day, dateDisplay, dateValue, initialLocation, isLocked }: TarawihItemProps) {
    const [isPending, startTransition] = useTransition()

    const handleSelect = (location: string) => {
        if (isLocked) return // Proteksi klik
        const newLocation = initialLocation === location ? null : location
        startTransition(async () => {
            await updateTarawihLocation(day, dateValue, newLocation)
        })
    }

    return (
        <div className={`
            border rounded-xl p-4 flex items-center justify-between transition-all
            ${isLocked 
                ? "bg-gray-50 border-gray-100 opacity-60 grayscale" // Tampilan Terkunci
                : "bg-white border-gray-100 shadow-sm hover:shadow-md" // Tampilan Normal
            }
        `}>
            <div>
                <h3 className={`font-bold ${isLocked ? "text-gray-400" : "text-gray-800"}`}>
                    Malam ke-{day}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    {dateDisplay}
                    {isLocked && <Lock size={10} className="text-gray-400" />}
                </p>
            </div>

            <div className="flex gap-2">
                {/* Tombol Rumah */}
                <button
                    onClick={() => handleSelect('Rumah')}
                    disabled={isPending || isLocked}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border text-xs font-medium transition-all w-16 md:w-20
                        ${isLocked 
                            ? "bg-transparent border-gray-200 text-gray-300 cursor-not-allowed" // Disabled Style
                            : initialLocation === 'Rumah' 
                                ? "bg-violet-100 border-violet-200 text-violet-700" 
                                : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                        }
                    `}
                >
                    <Home size={18} className={!isLocked && initialLocation === 'Rumah' ? "fill-violet-700" : ""} />
                    Rumah
                </button>

                {/* Tombol Masjid */}
                <button
                    onClick={() => handleSelect('Masjid')}
                    disabled={isPending || isLocked}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border text-xs font-medium transition-all w-16 md:w-20
                        ${isLocked 
                            ? "bg-transparent border-gray-200 text-gray-300 cursor-not-allowed" // Disabled Style
                            : initialLocation === 'Masjid' 
                                ? "bg-violet-600 border-violet-600 text-white shadow-md" 
                                : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                        }
                    `}
                >
                    <Moon size={18} className={!isLocked && initialLocation === 'Masjid' ? "fill-white" : ""} />
                    Masjid
                </button>
            </div>
        </div>
    )
}