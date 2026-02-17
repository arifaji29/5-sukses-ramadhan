'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 1. Fungsi Toggle Khatam per Juz (Checklist) + Auto Reset Khatam 30 Juz
export async function toggleJuzCompletion(
  juzNumber: number, 
  currentStatus: boolean,
  lastReadData?: { surah: number, ayah: number } // Parameter Opsional
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Logic: Jika sudah selesai (true) -> jadi 0 (belum). Jika belum -> jadi 1 (selesai).
  const newCount = currentStatus ? 0 : 1

  // Siapkan data yang mau di-update
  const updateData: any = {
    user_id: user.id,
    juz_number: juzNumber,
    completion_count: newCount,
    last_read_at: newCount === 1 ? new Date().toISOString() : null
  }

  // JIKA user menandai SELESAI (newCount === 1) DAN ada data ayat terakhir
  // Maka otomatis update bookmark ke ayat terakhir tersebut
  if (newCount === 1 && lastReadData) {
      updateData.last_read_surah = lastReadData.surah;
      updateData.last_read_ayah = lastReadData.ayah;
  }

  // A. Simpan Status Juz yang diklik
  const { error } = await supabase
    .from('quran_progress')
    .upsert(updateData, {
        onConflict: 'user_id, juz_number'
    })

  if (error) {
    throw new Error(error.message)
  }

  // ============================================================
  // B. LOGIKA PENGECEKAN KHATAM (30 JUZ)
  // ============================================================
  if (newCount === 1) { // Hanya cek jika user BARU SAJA menyelesaikan juz
      
      // Hitung berapa juz yang sudah selesai (count rows with completion_count > 0)
      const { count } = await supabase
        .from('quran_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('completion_count', 0) 

      // C. Jika sudah 30 Juz, Reset Semuanya & Tambah Counter Khatam
      if (count === 30) {
          
          // 1. Tambah Total Khatam di user_settings
          // Kita ambil data lama dulu untuk ditambah 1
          const { data: settings } = await supabase
            .from('user_settings')
            .select('total_khatam_count')
            .eq('user_id', user.id)
            .single()
            
          const currentTotal = settings?.total_khatam_count || 0

          await supabase
            .from('user_settings')
            .upsert({
                user_id: user.id,
                total_khatam_count: currentTotal + 1,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

          // 2. Reset Semua Progress Juz jadi 0 (KOSONGKAN CARD)
          await supabase
            .from('quran_progress')
            .update({ 
                completion_count: 0,
                last_read_surah: null,
                last_read_ayah: null,
                last_read_at: null
            })
            .eq('user_id', user.id)
      }
  }
  // ============================================================

  // Refresh Dashboard DAN Halaman Juz itu sendiri
  revalidatePath('/tadarus')
  revalidatePath(`/tadarus/juz/${juzNumber}`)
}

// 2. Fungsi Simpan Bookmark (Biarkan tetap sama)
export async function saveLastRead(
  juz: number, 
  surah: number | null, // Boleh null (untuk reset)
  ayah: number | null   // Boleh null (untuk reset)
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('quran_progress')
    .upsert({ 
        user_id: user.id,
        juz_number: juz,
        last_read_surah: surah, // Jika null, database akan menghapus datanya
        last_read_ayah: ayah,
    }, {
        onConflict: 'user_id, juz_number'
    })

  if (error) {
    throw new Error(error.message)
  }
  
  // Refresh agar UI langsung berubah (tombol jadi "Tandai" lagi)
  revalidatePath(`/tadarus/juz/${juz}`)
}

// 3. FUNGSI UPDATE TARGET KHATAM (Tetap Ada)
export async function updateKhatamTarget(target: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('user_settings')
    .upsert({ 
        user_id: user.id,
        khatam_target: target,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id'
    })

  if (error) throw new Error(error.message)
  
  // Refresh Dashboard agar target langsung berubah
  revalidatePath('/tadarus')
}

// 4. FUNGSI RESET TOTAL DATA (Danger Zone)
export async function resetUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Reset Counter Khatam & Target di user_settings
  const { error: errorSettings } = await supabase
    .from('user_settings')
    .upsert({ 
        user_id: user.id,
        total_khatam_count: 0, // Reset ke 0
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (errorSettings) throw new Error(errorSettings.message)

  // 2. Hapus Semua Progress Juz
  const { error: errorProgress } = await supabase
    .from('quran_progress')
    .delete()
    .eq('user_id', user.id)

  if (errorProgress) throw new Error(errorProgress.message)

  revalidatePath('/tadarus')
}

// 5. FUNGSI BARU: "SOFT RESET" (HAPUS PROGRESS SAJA, PERTAHANKAN KHATAM)
export async function restartCurrentRound() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // HANYA Hapus Progress Juz (Kartu jadi putih semua)
  // TIDAK MENGUBAH total_khatam_count di user_settings
  const { error } = await supabase
    .from('quran_progress')
    .delete()
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/tadarus')
}

// 6. DEV TOOL: INSTANT UPDATE PROGRESS
export async function devToolUpdate(khatamCount: number, juzCount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Update Jumlah Khatam di user_settings
  const { error: errSettings } = await supabase
    .from('user_settings')
    .upsert({ 
        user_id: user.id,
        total_khatam_count: khatamCount,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (errSettings) throw new Error(errSettings.message)

  // 2. Reset Dulu Semua Progress Juz (Hapus semua checklist)
  const { error: errDelete } = await supabase
    .from('quran_progress')
    .delete()
    .eq('user_id', user.id)

  if (errDelete) throw new Error(errDelete.message)

  // 3. Insert Bulk (Checklist Juz 1 sampai Juz ke-N)
  if (juzCount > 0) {
      const newRecords = Array.from({ length: juzCount }).map((_, i) => ({
          user_id: user.id,
          juz_number: i + 1, // Juz 1, 2, ...
          completion_count: 1, // Tandai Selesai
          last_read_at: new Date().toISOString()
      }))

      const { error: errInsert } = await supabase
        .from('quran_progress')
        .insert(newRecords)

      if (errInsert) throw new Error(errInsert.message)
  }

  revalidatePath('/tadarus')
}