'use client'

import { useState } from 'react'
import { Share2, Copy, CheckCircle2, Users } from 'lucide-react'

export default function InviteBanner() {
  const [copied, setCopied] = useState(false)
  const shareUrl = "https://5sukses-ramadhan.netlify.app/skip"
  
  // Pesan default saat tombol share ditekan
  const shareMessage = `Assalamu'alaikum! Yuk bareng-bareng sukseskan 5 Sukses Ramadhan.\n\nKlik link ini ya :\n${shareUrl}`

  const handleShare = async () => {
    // Mengecek apakah browser HP mendukung fitur "Share" bawaan (seperti share ke WA, IG, dll)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '5 Sukses Ramadhan',
          text: shareMessage,
        })
      } catch (err) {
        console.log('Share dibatalkan atau error:', err)
      }
    } else {
      // Jika dibuka di laptop/browser yang tidak support share, otomatis jalankan Copy
      handleCopy()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-linear-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 md:p-5 shadow-sm border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4 mx-4 md:mx-0 relative overflow-hidden">
        {/* Dekorasi tipis di background */}
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none -mt-4 -mr-4">
            <Users size={100} />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                <Users size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
                <h3 className="font-bold text-emerald-900 text-sm md:text-base">Ajak Teman Bergabung!</h3>
                <p className="text-xs md:text-sm text-emerald-700 leading-snug mt-0.5">Bagikan link ini agar temanmu bisa langsung masuk tanpa daftar.</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto relative z-10">
            <button 
                onClick={handleCopy}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm"
            >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Tersalin!" : "Salin Link"}
            </button>
            <button 
                onClick={handleShare}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-md shadow-emerald-200 active:scale-95"
            >
                <Share2 size={16} />
                Bagikan
            </button>
        </div>
    </div>
  )
}