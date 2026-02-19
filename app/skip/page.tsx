'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SkipPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function autoLogin() {
      // 1. Cek sesi dulu, siapa tahu user sebenarnya sudah login
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        router.push('/') // Kalau sudah login, langsung ke Dashboard
        return
      }

      // 2. Eksekusi Login Anonim (Guest)
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('Error auto login:', error.message)
        alert('Gagal masuk secara otomatis. Silakan coba login manual.')
        router.push('/login')
        return
      }

      // 3. (Opsional) Beri nama default di tabel profile
      if (data.user) {
        // UPDATE: Nama otomatis diset menjadi "Hamba Allah"
        const guestName = "Hamba Allah"
        
        // Update tabel profile agar mereka punya nama di leaderboard
        await supabase
          .from('profiles')
          .update({ username: guestName })
          .eq('id', data.user.id)
      }

      // 4. Sukses! Arahkan ke Dashboard
      router.push('/')
      router.refresh()
    }

    autoLogin()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Menyiapkan Akun...</h2>
        <p className="text-sm text-gray-500 text-center">
          Mohon tunggu sebentar, Anda akan segera masuk ke aplikasi.
        </p>
      </div>
    </div>
  )
}