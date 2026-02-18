'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const username = formData.get('username') as string
  const avatarUrl = formData.get('avatar_url') as string // Ambil URL string, bukan File

  // Siapkan data update
  const updates: any = {
    username: username,
    updated_at: new Date().toISOString(),
  }

  // Jika user memilih avatar baru, update. Jika tidak, biarkan yang lama.
  if (avatarUrl) {
    updates.avatar_url = avatarUrl
  }

  // Update Table Profiles
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error('Gagal update profil')
  }

  revalidatePath('/')
  revalidatePath('/profile')
  revalidatePath('/leaderboard')
  
  return { success: true }
}