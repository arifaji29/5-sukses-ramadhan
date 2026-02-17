'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleItikaf(day: number, date: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  if (!isCompleted) {
      // Jika di-uncheck (isCompleted = false), HAPUS datanya
      const { error } = await supabase
        .from('lailatul_qadar_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('night_number', day)
      
      if (error) console.error("Error deleting:", error)
  } else {
      // Jika di-check (isCompleted = true), TAMBAH datanya
      const { error } = await supabase
        .from('lailatul_qadar_progress')
        .upsert({
          user_id: user.id,
          night_number: day,
          // date: date,       <-- SUDAH DIHAPUS (karena tidak ada di DB)
          // updated_at: ...,  <-- HAPUS INI JUGA (karena tidak ada di DB)
          is_itikaf: true,
      }, { onConflict: 'user_id, night_number' })

      if (error) {
        console.error("Error upserting:", error)
        throw new Error(error.message)
      }
  }

  revalidatePath('/lailatul-qadar')
}