'use client' // Ubah jadi client component untuk interaksi hamburger

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Moon, Sun, CheckCircle, LogOut, Menu, X, Star } from "lucide-react"
import { logout } from "@/app/(auth)/actions"
import MobileBottomNav from "../../components/layout/MobileBottomNav" // Import yang baru dibuat

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // Helper untuk class active link sidebar
  const getLinkClass = (href: string) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      pathname === href 
      ? "bg-emerald-50 text-emerald-700 shadow-sm" 
      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
    }`

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* 1. SIDEBAR DESKTOP & MOBILE DRAWER */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:flex md:flex-col
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-emerald-200 shadow-lg">
                    5S
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 leading-tight">Ramadhan</h1>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wider">REMINDER</p>
                </div>
            </div>
            {/* Close Button Mobile */}
            <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-red-500">
                <X size={24} />
            </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/" className={getLinkClass('/')} onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Menu Ibadah</p>
          </div>

          <Link href="/puasa" className={getLinkClass('/puasa')} onClick={() => setIsSidebarOpen(false)}>
            <Sun size={20} />
            <span>1. Sukses Puasa</span>
          </Link>

          <Link href="/tarawih" className={getLinkClass('/tarawih')} onClick={() => setIsSidebarOpen(false)}>
            <Moon size={20} />
            <span>2. Sukses Tarawih</span>
          </Link>

          <Link href="/tadarus" className={getLinkClass('/tadarus')} onClick={() => setIsSidebarOpen(false)}>
            <BookOpen size={20} />
            <span>3. Sukses Tadarus</span>
          </Link>

          <Link href="/lailatul-qadar" className={getLinkClass('/lailatul-qadar')} onClick={() => setIsSidebarOpen(false)}>
            <Star size={20} />
            <span>4. Lailatul Qadar</span>
          </Link>

          <Link href="/zakat" className={getLinkClass('/zakat')} onClick={() => setIsSidebarOpen(false)}>
            <CheckCircle size={20} />
            <span>5. Sukses Zakat</span>
          </Link>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100">
            <form action={logout}>
                <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium">
                    <LogOut size={20} />
                    <span>Keluar Aplikasi</span>
                </button>
            </form>
        </div>
      </aside>

      {/* Overlay untuk Mobile saat Sidebar terbuka */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* MOBILE HEADER (Hamburger) */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden z-20 sticky top-0">
            <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    5S
                </div>
                <h1 className="font-bold text-gray-800">5 Sukses Ramadhan</h1>
            </div>
            <button 
                onClick={toggleSidebar}
                className="p-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
                <Menu size={24} />
            </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          {children}
        </main>

        {/* 3. STICKY BOTTOM NAV (Mobile Only) */}
        <MobileBottomNav />

      </div>
    </div>
  )
}