'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon, BookOpen, Star, CheckCircle } from "lucide-react"

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: "Puasa", href: "/puasa", icon: Sun },
    { name: "Tarawih", href: "/tarawih", icon: Moon },
    { name: "Tadarus", href: "/tadarus", icon: BookOpen },
    { name: "L. Qadar", href: "/lailatul-qadar", icon: Star },
    { name: "Zakat", href: "/zakat", icon: CheckCircle },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-emerald-600" : "text-gray-400 hover:text-emerald-500"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-emerald-100" : "bg-transparent"}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}