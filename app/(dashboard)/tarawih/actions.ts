'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateTarawihLocation(day: number, date: string, location: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  if (location === null) {
      // Hapus data jika user uncheck
      const { error } = await supabase
          .from('tarawih_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('day', day)
      
      if (error) console.error("Error delete:", error)
  } else {
      // Upsert data (Insert or Update)
      // Format 'date' di sini harus YYYY-MM-DD
      const { error } = await supabase
          .from('tarawih_progress')
          .upsert({
              user_id: user.id,
              day: day,
              date: date, // Pastikan kolom di DB tipe DATE
              location: location,
              updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, day' })

      if (error) throw new Error(error.message)
  }

  revalidatePath('/tarawih')
}