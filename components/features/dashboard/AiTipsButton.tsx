"use client"

import { useState } from "react"
import { Sparkles, X, Bot } from "lucide-react"
import { getAiTipAction } from "./ai-actions"

interface AiTipsButtonProps {
    userName: string;
    totalPoints: number;
    currentDay: number;
}

export default function AiTipsButton({ userName, totalPoints, currentDay }: AiTipsButtonProps) {
    const [tip, setTip] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleGetTip = async () => {
        setLoading(true);
        const result = await getAiTipAction(userName, totalPoints, currentDay);
        setTip(result);
        setLoading(false);
    };

    return (
        <div className="mt-4">
            {!tip && (
                <button 
                    onClick={handleGetTip} 
                    disabled={loading}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 text-xs md:text-sm font-bold py-2 px-4 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="animate-pulse">Memanggil AI...</span>
                    ) : (
                        <>
                            <Sparkles size={16} /> Minta Tips Poin AI
                        </>
                    )}
                </button>
            )}

            {tip && (
                <div className="bg-white/10 backdrop-blur-md border border-yellow-300/50 p-3 md:p-4 rounded-2xl relative animate-in fade-in zoom-in-95 duration-300 max-w-sm shadow-inner mt-2">
                    <button 
                        onClick={() => setTip("")} 
                        className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <div className="flex gap-3 items-start">
                        <div className="bg-yellow-400 p-1.5 rounded-full text-yellow-900 shrink-0 mt-0.5">
                            <Bot size={16} />
                        </div>
                        <p className="text-emerald-50 text-xs md:text-sm leading-relaxed pr-4">
                            {tip}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}