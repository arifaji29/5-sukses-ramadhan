"use client" // Diubah menjadi Client Component untuk menggunakan useState

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signup } from '../actions'
import { Eye, EyeOff } from 'lucide-react' // Menambahkan ikon mata

export default function RegisterPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [showPassword, setShowPassword] = useState(false) // State untuk toggle password
  
  // Menangani unwrapping searchParams di Client Component
  const [error, setError] = useState<string | null>(null)
  props.searchParams?.then(params => {
      if (params.error) setError(params.error as string)
  })

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-emerald-500 via-teal-600 to-emerald-800 p-4">
      
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section */}
        <div className="mb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full shadow-lg w-23 h-23 flex items-center justify-center overflow-hidden bg-white">
               <Image 
                src="/logo1.png" 
                alt="Logo Ramadhan" 
                width={100} 
                height={100} 
                className="object-cover w-full h-full"
                priority
               />
            </div>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Daftar Akun Baru
          </h2>
          <p className="mt-1 text-sm text-emerald-50 font-bold">
            Mulai Program 5 Sukses Ramadhan
          </p>
        </div>

        <form className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1">
            <label htmlFor="username" className="block text-xs font-bold text-emerald-50 uppercase tracking-wider ml-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="nickname"
              required
              placeholder="Contoh: Fulan123"
              className="block w-full rounded-xl bg-white/90 border-transparent shadow-sm focus:border-white focus:ring-4 focus:ring-white/20 sm:text-sm p-3 border text-gray-900 transition-all outline-none"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-bold text-emerald-50 uppercase tracking-wider ml-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email username"
              required
              placeholder="nama@email.com"
              className="block w-full rounded-xl bg-white/90 border-transparent shadow-sm focus:border-white focus:ring-4 focus:ring-white/20 sm:text-sm p-3 border text-gray-900 transition-all outline-none"
            />
          </div>

          {/* Password Input dengan Tombol Hide/Unhide */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-bold text-emerald-50 uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Logika hide-unhide
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="block w-full rounded-xl bg-white/90 border-transparent shadow-sm focus:border-white focus:ring-4 focus:ring-white/20 sm:text-sm p-3 border text-gray-900 transition-all outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-emerald-700 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-white px-4 py-2 rounded-xl text-xs backdrop-blur-md">
                  ⚠️ {error}
              </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              formAction={signup}
              className="flex w-full justify-center rounded-xl bg-emerald-900 py-3 px-4 text-sm font-bold text-white shadow-lg hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-white transition-all active:scale-[0.98]"
            >
              Daftar Sekarang
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-emerald-50 font-medium">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-white underline decoration-emerald-300 underline-offset-4 hover:text-emerald-200">
              Masuk disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}