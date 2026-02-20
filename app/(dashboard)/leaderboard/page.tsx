import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Trophy, Medal, User, Crown, AlertTriangle, Lightbulb } from "lucide-react"

// IMPORT KOMPONEN BANNER AJAK TEMAN
import InviteBanner from "@/components/features/leaderboard/InviteBanner"

// Tipe Data Leaderboard sesuai kolom di View Database
type LeaderboardItem = {
    user_id: string
    display_name: string
    total_points: number
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. AMBIL DATA DARI VIEW 'global_leaderboard'
  // View ini sudah mengatasi masalah RLS dan logika perhitungan poin
  const { data: leaderboard, error } = await supabase
    .from('global_leaderboard')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(50) // Batasi Top 50 agar performa tetap cepat

  if (error) {
      console.error("Leaderboard Error:", error)
  }

  const listData = (leaderboard as LeaderboardItem[]) || []
  
  // Pisahkan Top 3 dan Sisanya
  const topThree = listData.slice(0, 3)
  const restOfUsers = listData.slice(3)

  // Cari Ranking User yang sedang Login
  const myRankIndex = listData.findIndex(p => p.user_id === user.id)
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : '-'
  const myData = listData.find(p => p.user_id === user.id)

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
      
      {/* --- INJEKSI CSS ANIMASI MARQUEE --- */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          display: inline-flex;
          animation: scroll 15s linear infinite;
          /* Memastikan lebar animasi minimal selebar container agar efeknya mulus */
          min-width: 100%; 
        }
        .animate-scroll:hover, .animate-scroll:active {
          animation-play-state: paused;
        }
      `}</style>

      {/* --- HEADER --- */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-800 rounded-b-3xl md:rounded-3xl p-8 text-white shadow-xl relative overflow-hidden text-center flex flex-col items-center">
         {/* Hiasan Background */}
         <div className="absolute top-0 left-0 w-full h-full bg-white/5 pattern-grid-lg opacity-10 pointer-events-none"></div>
         
         <div className="relative z-10 w-full flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <Trophy className="text-yellow-300 fill-yellow-300" /> Leaderboard
            </h1>
            <p className="text-emerald-100 text-sm">
                Fastabiqul Khairat (Berlomba-lomba dalam kebaikan)
            </p>

            {/* --- WIDGET HINT (TEKS BERJALAN) --- */}
            <div className="mt-6 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full py-2 px-4 overflow-hidden relative w-full max-w-md shadow-inner cursor-default">
                <div className="w-full relative overflow-hidden flex items-center h-5">
                    <div className="animate-scroll absolute whitespace-nowrap flex items-center gap-2 justify-center pr-8">
                        <Lightbulb size={14} className="text-yellow-400 fill-yellow-400 shrink-0" />
                        <span className="text-xs md:text-sm text-emerald-50 font-medium tracking-wide">
                            Perbanyak tadarus Al-Qur'an untuk meningkatkan poin lebih cepat!
                        </span>
                    </div>
                </div>
            </div>
            {/* --------------------------------- */}
         </div>
      </div>

      {/* --- KARTU POSISI ANDA (Highlight) --- */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex items-center justify-between mx-4 md:mx-0 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg shadow-inner border border-emerald-200">
                  #{myRank}
              </div>
              <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Peringkat Kamu</p>
                  <p className="font-bold text-gray-800 text-lg truncate max-w-37.5">
                      {myData?.display_name || "Kamu"}
                  </p>
              </div>
          </div>
          <div className="text-right">
              <div className="text-2xl font-black text-emerald-600">
                  {myData?.total_points || 0}
              </div>
              <div className="text-[10px] font-medium text-gray-400 uppercase">Total Poin</div>
          </div>
      </div>

      {/* --- BANNER AJAK TEMAN --- */}
      <div className="mx-4 md:mx-0">
          <InviteBanner />
      </div>

      {/* --- TAMPILAN JIKA DATA KOSONG --- */}
      {listData.length === 0 && (
          <div className="text-center p-10 bg-gray-50 rounded-2xl border border-gray-100 mx-4 md:mx-0 flex flex-col items-center justify-center min-h-50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <AlertTriangle className="text-yellow-500" size={32} />
              </div>
              <p className="text-gray-900 font-bold">Belum ada data leaderboard.</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Data akan muncul setelah ada aktivitas ibadah yang tercatat. Pastikan View Database sudah dibuat.
              </p>
          </div>
      )}

      {/* --- PODIUM TOP 3 --- */}
      {listData.length > 0 && (
          <div className="flex items-end justify-center gap-2 md:gap-4 px-4 h-56 mb-8 mt-4">
              
              {/* JUARA 2 (Kiri) */}
              <div className="flex flex-col items-center w-1/3 group">
                  {topThree[1] ? (
                      <>
                        <div className="mb-3 text-center transition-transform group-hover:-translate-y-1">
                            <p className="text-xs font-bold text-gray-600 line-clamp-1 px-1">{topThree[1].display_name}</p>
                            <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                                {topThree[1].total_points} Pts
                            </span>
                        </div>
                        <div className="w-full h-28 bg-linear-to-b from-gray-200 to-gray-300 rounded-t-2xl flex items-start justify-center pt-3 relative shadow-md border-t border-white/50">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border-2 border-gray-300 absolute -top-4 shadow-sm text-sm">
                                2
                            </div>
                            <Medal className="text-gray-400 mt-4 opacity-50" size={32} />
                        </div>
                      </>
                  ) : <div className="w-full h-28 bg-transparent" />}
              </div>

              {/* JUARA 1 (Tengah - Paling Tinggi) */}
              <div className="flex flex-col items-center w-1/3 z-10 group">
                  {topThree[0] ? (
                      <>
                        <div className="mb-3 text-center transition-transform group-hover:-translate-y-2">
                            <Crown className="mx-auto text-yellow-500 fill-yellow-500 mb-1 animate-bounce" size={24} />
                            <p className="text-sm font-bold text-emerald-800 line-clamp-1 px-1">{topThree[0].display_name}</p>
                            <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border border-yellow-200">
                                {topThree[0].total_points} Pts
                            </span>
                        </div>
                        <div className="w-full h-40 bg-linear-to-b from-yellow-300 to-yellow-500 rounded-t-2xl flex items-start justify-center pt-3 relative shadow-lg border-t border-white/50">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-yellow-600 font-bold border-4 border-yellow-400 absolute -top-5 shadow-md text-lg">
                                1
                            </div>
                            <Trophy className="text-white mt-8 drop-shadow-md" size={40} />
                        </div>
                      </>
                  ) : <div className="w-full h-40 bg-transparent" />}
              </div>

              {/* JUARA 3 (Kanan) */}
              <div className="flex flex-col items-center w-1/3 group">
                  {topThree[2] ? (
                      <>
                        <div className="mb-3 text-center transition-transform group-hover:-translate-y-1">
                            <p className="text-xs font-bold text-orange-800 line-clamp-1 px-1">{topThree[2].display_name}</p>
                            <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                                {topThree[2].total_points} Pts
                            </span>
                        </div>
                        <div className="w-full h-24 bg-linear-to-b from-orange-200 to-orange-300 rounded-t-2xl flex items-start justify-center pt-3 relative shadow-md border-t border-white/50">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-orange-300 absolute -top-4 shadow-sm text-sm">
                                3
                            </div>
                            <Medal className="text-orange-500 mt-4 opacity-50" size={32} />
                        </div>
                      </>
                  ) : <div className="w-full h-24 bg-transparent" />}
              </div>
          </div>
      )}

      {/* --- LIST PERINGKAT 4 KE BAWAH --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 md:mx-0">
          {restOfUsers.map((player, index) => (
              <div 
                key={player.user_id} 
                className={`flex items-center justify-between p-4 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 ${player.user_id === user.id ? 'bg-emerald-50/60 hover:bg-emerald-50' : ''}`}
              >
                  <div className="flex items-center gap-4">
                      <span className="w-8 text-center font-bold text-gray-400 text-sm italic">
                          #{index + 4}
                      </span>
                      <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${player.user_id === user.id ? 'bg-emerald-100 border-emerald-200' : 'bg-gray-100 border-gray-200'}`}>
                              <User size={18} className={player.user_id === user.id ? 'text-emerald-600' : 'text-gray-400'} />
                          </div>
                          <div>
                              <p className={`text-sm font-bold ${player.user_id === user.id ? 'text-emerald-700' : 'text-gray-700'}`}>
                                  {player.display_name}
                                  {player.user_id === user.id && <span className="text-[10px] font-normal text-emerald-500 ml-1 bg-emerald-100 px-1.5 py-0.5 rounded-full">(Kamu)</span>}
                              </p>
                          </div>
                      </div>
                  </div>
                  <div className="font-bold text-gray-700 text-sm bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      {player.total_points} Pts
                  </div>
              </div>
          ))}

          {/* Empty State jika user < 3 */}
          {restOfUsers.length === 0 && listData.length > 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                  <p>Semua peserta sudah masuk podium!</p>
                  <p className="text-xs mt-1">Ajak temanmu untuk ikut berlomba.</p>
              </div>
          )}
      </div>

    </div>
  )
}