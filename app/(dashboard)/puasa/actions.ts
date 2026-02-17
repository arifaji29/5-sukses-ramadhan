'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function togglePuasa(day: number, date: string, isFasting: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  if (!isFasting) {
      await supabase.from('puasa_progress').delete()
        .eq('user_id', user.id)
        .eq('day', day)
  } else {
      await supabase.from('puasa_progress').upsert({
          user_id: user.id,
          day: day,
          date: date, // Simpan tanggal ISO
          is_fasting: true,
          updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, day' })
  }

  revalidatePath('/puasa')
}