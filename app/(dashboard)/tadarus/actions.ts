'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 1. Fungsi Toggle Khatam per Juz (Checklist Saja)
export async function toggleJuzCompletion(
  juzNumber: number, 
  currentStatus: boolean,
  lastReadData?: { surah: number, ayah: number } 
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const newCount = currentStatus ? 0 : 1

  const updateData: any = {
    user_id: user.id,
    juz_number: juzNumber,
    completion_count: newCount,
    last_read_at: newCount === 1 ? new Date().toISOString() : null
  }

  if (newCount === 1 && lastReadData) {
      updateData.last_read_surah = lastReadData.surah;
      updateData.last_read_ayah = lastReadData.ayah;
  }

  const { error } = await supabase
    .from('quran_progress')
    .upsert(updateData, {
        onConflict: 'user_id, juz_number'
    })

  if (error) throw new Error(error.message)

  revalidatePath('/tadarus')
  revalidatePath(`/tadarus/juz/${juzNumber}`)
}

// 2. FUNGSI RESET TOTAL (DIPERBAIKI UNTUK BERSIH TOTAL)
export async function resetCurrentPeriod() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  try {
    // A. Tambah Total Khatam
    const { data: settings } = await supabase
      .from('user_settings')
      .select('total_khatam_count')
      .eq('user_id', user.id)
      .single()

    const currentTotal = settings?.total_khatam_count || 0

    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({ 
        user_id: user.id, 
        total_khatam_count: currentTotal + 1,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (settingsError) throw settingsError

    // B. BERSIHKAN TOTAL PROGRESS (FIXED)
    // Kita set last_read_surah dan last_read_ayah menjadi NULL
    const { error: progressError } = await supabase
      .from('quran_progress')
      .update({ 
          completion_count: 0,
          last_read_at: null,
          last_read_surah: null, // Hapus jejak surah
          last_read_ayah: null   // Hapus jejak ayat
      })
      .eq('user_id', user.id)

    if (progressError) throw progressError

    revalidatePath('/tadarus')
    revalidatePath('/') 
    
    return { success: true }

  } catch (error) {
    console.error("Error resetting period:", error)
    return { success: false, error }
  }
}

// ... (Sisa fungsi lainnya biarkan tetap sama) ...
export async function saveLastRead(juz: number, surah: number | null, ayah: number | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('quran_progress')
    .upsert({ 
        user_id: user.id,
        juz_number: juz,
        last_read_surah: surah, 
        last_read_ayah: ayah,
    }, { onConflict: 'user_id, juz_number' })

  if (error) throw new Error(error.message)
  revalidatePath(`/tadarus/juz/${juz}`)
}

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
    }, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/tadarus')
}

export async function resetUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error: errorSettings } = await supabase
    .from('user_settings')
    .upsert({ 
        user_id: user.id,
        total_khatam_count: 0, 
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (errorSettings) throw new Error(errorSettings.message)

  const { error: errorProgress } = await supabase
    .from('quran_progress')
    .delete() // Hapus bersih baris data
    .eq('user_id', user.id)

  if (errorProgress) throw new Error(errorProgress.message)
  revalidatePath('/tadarus')
}

export async function restartCurrentRound() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('quran_progress')
    .delete() // Hapus bersih baris data
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/tadarus')
}

export async function devToolUpdate(khatamCount: number, juzCount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error: errSettings } = await supabase
    .from('user_settings')
    .upsert({ 
        user_id: user.id,
        total_khatam_count: khatamCount,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (errSettings) throw new Error(errSettings.message)

  const { error: errDelete } = await supabase
    .from('quran_progress')
    .delete()
    .eq('user_id', user.id)

  if (errDelete) throw new Error(errDelete.message)

  if (juzCount > 0) {
      const newRecords = Array.from({ length: juzCount }).map((_, i) => ({
          user_id: user.id,
          juz_number: i + 1, 
          completion_count: 1, 
          last_read_at: new Date().toISOString()
      }))

      const { error: errInsert } = await supabase
        .from('quran_progress')
        .insert(newRecords)

      if (errInsert) throw new Error(errInsert.message)
  }
  revalidatePath('/tadarus')
}