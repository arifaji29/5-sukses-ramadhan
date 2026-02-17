import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation" // Import redirect
import Link from "next/link"
import { Sun, Moon, BookOpen, Star, CheckCircle, ArrowRight } from "lucide-react"

// Helper Component untuk Card Menu
function MenuCard({ 
    href, title, desc, icon: Icon, colorClass, delay 
}: { 
    href: string, title: string, desc: string, icon: any, colorClass: string, delay: string 
}) {
    return (
        <Link 
            href={href} 
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: delay }}
        >
            {/* Background Icon Decoration */}
            <div className={`absolute top-0 right-0 p-20 opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 ${colorClass.replace('text-', 'bg-')}`} />
            
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass} bg-opacity-10 bg-current`}>
                    <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{desc}</p>
                
                <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-emerald-600 transition-colors">
                    Lihat Progress <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Ambil data user
  const { data: { user } } = await supabase.auth.getUser()

  // PROTEKSI HALAMAN: Redirect ke login jika user belum login
  if (!user) {
    redirect('/login')
  }

  // Ambil Nama User (Opsional, ambil dari email jika metadata kosong)
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || "Hamba Allah"

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* SECTION 1: WELCOME BANNER */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-800 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
         {/* Dekorasi Background */}
         <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <Star size={300} />
         </div>
         
         <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
                Assalamu'alaikum, {displayName}! 👋
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed mb-6">
               Yuk berlomba-lomba dalam kebaikan, perbanyak ibadah, dan maksimalkan pahala di bulan Ramadhan.
            </p>
         </div>
      </div>

      {/* SECTION 2: GRID MENU PROGRESS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-500 rounded-full"/>
            Menu 5 Sukses
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <MenuCard 
                href="/puasa"
                title="1. Sukses Puasa"
                desc="Catat hari-harimu berpuasa dan jaga lisan serta hati."
                icon={Sun}
                colorClass="text-orange-500"
                delay="0ms"
            />
             <MenuCard 
                href="/tarawih"
                title="2. Sukses Tarawih"
                desc="Hidupkan malam Ramadhan dengan sholat Tarawih berjamaah."
                icon={Moon}
                colorClass="text-violet-500"
                delay="100ms"
            />
             <MenuCard 
                href="/tadarus"
                title="3. Sukses Tadarus"
                desc="Targetkan khatam Al-Qur'an minimal satu kali bulan ini."
                icon={BookOpen}
                colorClass="text-blue-500"
                delay="200ms"
            />
             <MenuCard 
                href="/lailatul-qadar"
                title="4. Lailatul Qadar"
                desc="Raih kemuliaan malam seribu bulan di 10 hari terakhir."
                icon={Star}
                colorClass="text-yellow-500"
                delay="300ms"
            />
             <MenuCard 
                href="/zakat"
                title="5. Sukses Zakat"
                desc="Tunaikan zakat fitrah sebelum sholat Idul Fitri."
                icon={CheckCircle}
                colorClass="text-green-600"
                delay="400ms"
            />
        </div>
      </div>

    </div>
  )
}