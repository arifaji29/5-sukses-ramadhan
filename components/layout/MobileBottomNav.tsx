'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Sun, Moon, BookOpen, Star, CheckCircle, Loader2 } from "lucide-react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  
  // State untuk melacak menu mana yang sedang dituju (loading)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  // Reset loading saat URL (pathname) sudah berhasil berubah
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  const navItems = [
    { name: "Puasa", href: "/puasa", icon: Sun },
    { name: "Tarawih", href: "/tarawih", icon: Moon },
    { name: "Tadarus", href: "/tadarus", icon: BookOpen },
    { name: "L. Qadar", href: "/lailatul-qadar", icon: Star },
    { name: "Zakat", href: "/zakat", icon: CheckCircle },
  ]

  // Handler saat menu diklik
  const handleNavClick = (href: string) => {
    if (pathname === href) return; // Jangan loading jika klik menu yang sama
    setNavigatingTo(href);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isNavigatingHere = navigatingTo === item.href // Cek apakah menu ini sedang loading
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                isActive ? "text-emerald-600" : "text-gray-400 hover:text-emerald-500"
              } ${isNavigatingHere ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-emerald-100" : "bg-transparent"}`}>
                {/* Tampilkan animasi berputar jika sedang navigasi ke halaman ini */}
                {isNavigatingHere ? (
                    <Loader2 size={20} className="animate-spin text-emerald-500" />
                ) : (
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}