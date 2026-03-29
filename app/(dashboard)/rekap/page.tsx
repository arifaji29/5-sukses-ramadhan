import { createClient } from "@/lib/supabase/server"
import RaporAmal from "@/components/features/rekap/RaporAmal"
import { Trophy } from "lucide-react"
// 👈 IMPORT VARIABEL DINAMIS HARI
import { RAMADHAN_DAYS_TOTAL } from "@/lib/ramadhan-time"

export default async function RekapPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-8 text-center text-gray-500">Silakan login kembali.</div>
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', user.id)
        .single()
        
    const displayName = profile?.full_name || profile?.username || "Hamba Allah"
    const avatarUrl = profile?.avatar_url || null

    const { data: globalLeaderboard } = await supabase
        .from('global_leaderboard')
        .select('user_id, total_points')
        .order('total_points', { ascending: false });
    
    let userRank: number | string = '-';
    let totalPoints = 0;

    if (globalLeaderboard) {
        const rankIndex = globalLeaderboard.findIndex(p => p.user_id === user.id);
        if (rankIndex !== -1) {
            userRank = rankIndex + 1; 
            totalPoints = globalLeaderboard[rankIndex].total_points || 0;
        }
    }

    const { data: leaderboardView } = await supabase
        .from('leaderboard_view')
        .select('*');
    
    const userPointsData = leaderboardView?.find(p => p.id === user.id || p.user_id === user.id) || {};
    
    const poinPuasa = userPointsData.poin_puasa || 0;
    const poinTarawih = userPointsData.poin_tarawih || 0;
    const poinTadarus = userPointsData.poin_tadarus || 0;
    const poinItikaf = userPointsData.poin_itikaf || 0;
    const poinZakat = userPointsData.poin_zakat || 0;

    const { data: puasaProgress } = await supabase.from('puasa_progress').select('user_id').eq('user_id', user.id).eq('is_fasting', true);
    const finalPuasaCount = puasaProgress?.length || 0; 

    const { data: tarawihProgress } = await supabase.from('tarawih_progress').select('user_id').eq('user_id', user.id);
    const finalTarawihCount = tarawihProgress?.length || 0;

    const { data: settings } = await supabase.from('user_settings').select('total_khatam_count').eq('user_id', user.id).single();
    const historyKhatam = settings?.total_khatam_count || 0;

    const { data: itikafProgress } = await supabase.from('lailatul_qadar_progress').select('user_id').eq('user_id', user.id).eq('is_itikaf', true).gte('night_number', 21);
    const finalItikafCount = itikafProgress?.length || 0;

    const { data: zakatData } = await supabase.from('zakat_fitrah_progress').select('is_paid').eq('user_id', user.id);
    const isZakatPaid = zakatData?.some(z => z.is_paid === true) || false;

    const userStats = {
        puasa: { count: finalPuasaCount, points: poinPuasa },
        tarawih: { count: finalTarawihCount, points: poinTarawih },
        tadarus: { khatam: historyKhatam, points: poinTadarus },
        itikaf: { count: finalItikafCount, points: poinItikaf },
        zakat: { isPaid: isZakatPaid, points: poinZakat },
        totalPoints: totalPoints,
        // 👈 KIRIM TOTAL HARI KE KOMPONEN CLIENT
        ramadhanDaysTotal: RAMADHAN_DAYS_TOTAL 
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="text-center mb-8">
                <div className="inline-flex justify-center items-center bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4">
                    <Trophy size={40} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800">Rekap Perjalananmu</h1>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Satu bulan penuh perjuangan, ini adalah rapor pencapaian ibadahmu.</p>
            </div>

            <RaporAmal 
                userName={displayName} 
                avatarUrl={avatarUrl} 
                rank={userRank} 
                stats={userStats} 
            />
            
        </div>
    )
}