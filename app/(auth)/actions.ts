'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Ambil data dari form
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // UPDATE: Kirim pesan error asli dari Supabase
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Ambil data dari form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username, // Data ini akan masuk ke tabel profiles via Trigger
      },
    },
  })

  if (error) {
    // UPDATE: Kirim pesan error asli dari Supabase & Log ke terminal
    console.error("Signup Error:", error.message) 
    return redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// --- FUNGSI BARU: LOGOUT ---
// Ini untuk mengatasi error 404 saat klik tombol Keluar
export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout Error:", error.message)
  }

  // Bersihkan cache layout agar state login berubah di seluruh aplikasi
  revalidatePath('/', 'layout')
  redirect('/login')
}