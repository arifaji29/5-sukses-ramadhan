import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Trophy, Medal, User, Crown } from "lucide-react"

// Tipe Data Leaderboard
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

  // 1. Ambil Data dari View Database (Sangat Cepat)
  const { data: leaderboard } = await supabase
    .from('global_leaderboard')
    .select('*')
    .limit(50) // Ambil Top 50

  const topThree = leaderboard?.slice(0, 3) || []
  const restOfUsers = leaderboard?.slice(3) || []

  // Cari Ranking User Login
  const myRankIndex = leaderboard?.findIndex(p => p.user_id === user.id)
  const myRank = myRankIndex !== undefined && myRankIndex !== -1 ? myRankIndex + 1 : '-'
  const myData = leaderboard?.find(p => p.user_id === user.id)

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
      
      {/* HEADER */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-800 rounded-b-3xl md:rounded-3xl p-8 text-white shadow-xl relative overflow-hidden text-center">
         <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <Trophy className="text-yellow-300 fill-yellow-300" /> Leaderboard
            </h1>
            <p className="text-emerald-100 text-sm">
                Fastabiqul Khairat (Berlomba-lomba dalam kebaikan)
            </p>
         </div>
      </div>

      {/* POSISI USER SAAT INI (Sticky/Highlight) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex items-center justify-between mx-4 md:mx-0">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                  #{myRank}
              </div>
              <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Peringkat Kamu</p>
                  <p className="font-bold text-gray-800">{myData?.display_name || "Kamu"}</p>
              </div>
          </div>
          <div className="text-xl font-bold text-emerald-600">
              {myData?.total_points || 0} <span className="text-xs font-normal text-gray-400">Poin</span>
          </div>
      </div>

      {/* TOP 3 PODIUM */}
      <div className="flex items-end justify-center gap-2 md:gap-4 px-4 h-48 mb-8">
          {/* JUARA 2 */}
          {topThree[1] && (
              <div className="flex flex-col items-center w-1/3">
                  <div className="mb-2 text-center">
                      <p className="text-xs font-bold text-gray-600 line-clamp-1">{topThree[1].display_name}</p>
                      <p className="text-xs text-gray-400">{topThree[1].total_points} Poin</p>
                  </div>
                  <div className="w-full h-24 bg-gray-200 rounded-t-xl flex items-start justify-center pt-2 relative shadow-md">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold border-2 border-white absolute -top-4">
                          2
                      </div>
                      <Medal className="text-gray-400 mt-4" size={24} />
                  </div>
              </div>
          )}

          {/* JUARA 1 */}
          {topThree[0] && (
              <div className="flex flex-col items-center w-1/3 z-10">
                   <div className="mb-2 text-center">
                      <Crown className="mx-auto text-yellow-500 fill-yellow-500 mb-1 animate-bounce" size={20} />
                      <p className="text-sm font-bold text-emerald-700 line-clamp-1">{topThree[0].display_name}</p>
                      <p className="text-xs text-emerald-500 font-bold">{topThree[0].total_points} Poin</p>
                  </div>
                  <div className="w-full h-32 bg-linear-to-b from-yellow-300 to-yellow-500 rounded-t-xl flex items-start justify-center pt-2 relative shadow-lg">
                       <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-white absolute -top-5 shadow-sm">
                          1
                      </div>
                      <Trophy className="text-white mt-6" size={32} />
                  </div>
              </div>
          )}

          {/* JUARA 3 */}
          {topThree[2] && (
              <div className="flex flex-col items-center w-1/3">
                   <div className="mb-2 text-center">
                      <p className="text-xs font-bold text-orange-700 line-clamp-1">{topThree[2].display_name}</p>
                      <p className="text-xs text-orange-400">{topThree[2].total_points} Poin</p>
                  </div>
                  <div className="w-full h-20 bg-orange-100 rounded-t-xl flex items-start justify-center pt-2 relative shadow-md">
                      <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-white absolute -top-4">
                          3
                      </div>
                      <Medal className="text-orange-400 mt-4" size={24} />
                  </div>
              </div>
          )}
      </div>

      {/* LIST SISANYA (4 dst) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 md:mx-0">
          {restOfUsers.map((player, index) => (
              <div 
                key={player.user_id} 
                className={`flex items-center justify-between p-4 border-b border-gray-50 last:border-0 ${player.user_id === user.id ? 'bg-emerald-50' : ''}`}
              >
                  <div className="flex items-center gap-4">
                      <span className="w-6 text-center font-bold text-gray-400 text-sm">
                          {index + 4}
                      </span>
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User size={16} className="text-gray-400" />
                          </div>
                          <p className={`text-sm font-medium ${player.user_id === user.id ? 'text-emerald-700' : 'text-gray-700'}`}>
                              {player.display_name}
                              {player.user_id === user.id && " (Kamu)"}
                          </p>
                      </div>
                  </div>
                  <div className="font-bold text-gray-600 text-sm">
                      {player.total_points}
                  </div>
              </div>
          ))}

          {restOfUsers.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                  Belum ada peserta lain.
              </div>
          )}
      </div>

    </div>
  )
}