'use client' 

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image" 
import { usePathname, useRouter } from "next/navigation" 
import { createClient } from "@/lib/supabase/client" 
import { LayoutDashboard, BookOpen, Moon, Sun, CheckCircle, LogOut, Menu, X, Star, Trophy, AlertTriangle, Info, Loader2 } from "lucide-react" 
import { logout } from "@/app/(auth)/actions"
import MobileBottomNav from "../../components/layout/MobileBottomNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // State untuk deteksi Guest & Modal Peringatan
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)

  // State untuk animasi loading navigasi
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  const supabase = createClient()

  // --- UPDATE: Listener Real-time untuk Status Auth ---
  useEffect(() => {
    const checkInitialStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAnonymous(user?.is_anonymous || false)
    }
    checkInitialStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAnonymous(session.user.is_anonymous || false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // --- EFEK RESET LOADING ---
  useEffect(() => {
    setNavigatingTo(null)
    setIsSidebarOpen(false) 
  }, [pathname])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (pathname === href) return; 
      setNavigatingTo(href);
  }

  const getLinkClass = (href: string) => `
    flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium 
    ${pathname === href 
      ? "bg-emerald-50 text-emerald-700 shadow-sm" 
      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
    }
    ${navigatingTo === href ? "opacity-70 pointer-events-none" : ""}
  `

  const handleLogoutClick = (e: React.MouseEvent) => {
    if (isAnonymous) {
      e.preventDefault() 
      setShowLogoutWarning(true) 
      setIsSidebarOpen(false) 
    }
  }

  const goToProfile = () => {
    setShowLogoutWarning(false)
    router.push('/profile')
  }

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
      <Link href={href} className={getLinkClass(href)} onClick={(e) => handleNavClick(e, href)}>
        <div className="flex items-center gap-3">
            <Icon size={20} className={navigatingTo === href ? "animate-pulse text-emerald-500" : ""} />
            <span>{label}</span>
        </div>
        {navigatingTo === href && <Loader2 size={16} className="animate-spin text-emerald-500" />}
      </Link>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* --- MODAL PERINGATAN LOGOUT (KHUSUS GUEST) --- */}
      {showLogoutWarning && isAnonymous && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tunggu Dulu!</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Kamu masih masuk sebagai <strong>Guest</strong>. Jika kamu keluar sekarang, semua data poin dan ibadahmu akan <span className="text-red-500 font-bold">hilang selamanya</span>.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={goToProfile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200"
                >
                  Amankan Akun
                </button>
                <form action={logout} className="w-full">
                  <button 
                    type="submit"
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors"
                  >
                    Tetap Keluar
                  </button>
                </form>
                <button 
                  onClick={() => setShowLogoutWarning(false)}
                  className="w-full text-gray-400 hover:text-gray-600 font-medium py-2 mt-1 text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. SIDEBAR DESKTOP & MOBILE DRAWER */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        md:translate-x-0 md:static md:flex md:flex-col
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        
        {/* LOGO AREA - SIDEBAR */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-md border border-gray-100">
                    <Image src="/logo1.png" alt="Logo 5S" width={40} height={40} className="object-cover w-full h-full" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 leading-tight">5 SUKSES</h1>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wider">RAMADHAN</p>
                </div>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-red-500">
                <X size={24} />
            </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/leaderboard" icon={Trophy} label="Leaderboard" />
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Menu Ibadah</p>
          </div>

          <NavItem href="/puasa" icon={Sun} label="1. Sukses Puasa" />
          <NavItem href="/tarawih" icon={Moon} label="2. Sukses Tarawih" />
          <NavItem href="/tadarus" icon={BookOpen} label="3. Sukses Tadarus" />
          <NavItem href="/lailatul-qadar" icon={Star} label="4. Lailatul Qadar" />
          <NavItem href="/zakat" icon={CheckCircle} label="5. Sukses Zakat" />

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Lainnya</p>
          </div>

          <NavItem href="/about" icon={Info} label="Tentang Aplikasi" />
        </nav>

        {/* Logout Section */}
        {/* PERBAIKAN: Menambahkan pb-20 md:pb-4 agar tidak tertutup nav bawah di mobile */}
        <div className="p-4 pb-24 md:pb-4 border-t border-gray-100 shrink-0 bg-white">
            <form action={logout}>
                <button type="submit" onClick={handleLogoutClick} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium">
                    <LogOut size={20} />
                    <span>Keluar Aplikasi</span>
                </button>
            </form>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={toggleSidebar} />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        
        {/* MOBILE HEADER (Hamburger) */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden z-20 sticky top-0 shrink-0">
            <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-gray-100">
                    <Image src="/logo1.png" alt="Logo 5S" width={32} height={32} className="object-cover w-full h-full" />
                </div>
                <h1 className="font-bold text-gray-800">5 Sukses Ramadhan</h1>
            </div>
            <button onClick={toggleSidebar} className="p-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                <Menu size={24} />
            </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth relative">
          {navigatingTo && (
              <div className="absolute inset-0 bg-white/40 z-50 backdrop-blur-[1px] transition-all"></div>
          )}
          {children}
        </main>

        {/* 3. STICKY BOTTOM NAV (Mobile Only) */}
        <MobileBottomNav />

      </div>
    </div>
  )
}