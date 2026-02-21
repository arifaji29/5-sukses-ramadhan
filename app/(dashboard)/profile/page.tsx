'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateProfile } from "./actions"
import { Save, Loader2, ArrowLeft, CheckCircle2, AlertTriangle, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// --- KONFIGURASI AVATAR LOKAL ---
// Pastikan Anda sudah menaruh gambar di folder: public/avatars/
const AVATAR_OPTIONS = [
  // --- LAKI-LAKI ---
  "/avatars/pria-1.png",
  "/avatars/pria-2.png",
  "/avatars/pria-3.png",
  "/avatars/pria-4.png",
  
  // --- PEREMPUAN ---
  "/avatars/wanita-1.png",
  "/avatars/wanita-2.png",
  "/avatars/wanita-3.png",
  "/avatars/wanita-4.png",
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State untuk avatar
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")
  
  // State khusus untuk akun Guest (Anonim)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [upgrading, setUpgrading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // State untuk Hide/Unhide Password
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      // Dapatkan data sesi Auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Deteksi apakah ini akun guest
        setIsAnonymous(authUser.is_anonymous || false)

        // Dapatkan data profil dari tabel profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        setUser(profile)
        if (profile?.avatar_url) {
            setSelectedAvatar(profile.avatar_url)
        }
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  // Handler untuk menyimpan Nama & Avatar
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // MENCEGAH HALAMAN RELOAD/REFRESH
    setSaving(true);
    
    // Ambil data dari form
    const formData = new FormData(e.currentTarget);

    try {
      await updateProfile(formData);
      router.push('/'); 
      router.refresh();
    } catch (error) {
      alert("Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  }

  // Handler untuk mengubah akun Guest menjadi akun Permanen
  const handleUpgradeAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpgrading(true)

    const { data, error } = await supabase.auth.updateUser({
      email: email,
      password: password,
    })

    if (error) {
      alert("Gagal mengamankan akun: " + error.message)
    } else {
      alert("Sukses! Akun kamu sekarang permanen. Kamu bisa login kapan saja menggunakan Email ini.")
      setIsAnonymous(false) // Sembunyikan form setelah sukses
      setEmail("")
      setPassword("")
    }
    setUpgrading(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>

  return (
    <div className="max-w-lg mx-auto pb-20 pt-4 px-4">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
            <h1 className="text-xl font-bold text-gray-800">Edit Profil</h1>
            <p className="text-xs text-gray-500">Sesuaikan profil dan amankan akunmu</p>
        </div>
      </div>

      {/* FORM 1: UPGRADE AKUN (KHUSUS GUEST) */}
      {isAnonymous && (
        <div className="bg-orange-50 rounded-3xl shadow-sm border border-orange-200 p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600 mt-1">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="font-bold text-orange-800">Amankan Akun Kamu!</h2>
              <p className="text-sm text-orange-700 leading-relaxed mt-1">
                Kamu saat ini masuk sebagai <strong>Guest</strong>. Jika kamu keluar dari aplikasi, riwayat poinmu akan hilang. Tautkan Email & Password agar akunmu aman selamanya.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpgradeAccount} className="space-y-4" autoComplete="off">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email kamu (Bebas, tidak harus aktif)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-orange-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                required
                autoComplete="new-password" // Trik untuk mencegah browser autofill email
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} // Ganti tipe input berdasarkan state
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat Password (Min. 6 karakter)"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-orange-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                required
                minLength={6}
                autoComplete="new-password" // Trik untuk mencegah browser autofill password
              />
              
              {/* Tombol Hide/Unhide Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={upgrading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {upgrading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
              Jadikan Akun Permanen
            </button>
          </form>
        </div>
      )}

      {/* FORM 2: NAMA & AVATAR */}
      <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 p-6">
        {/* ACTION DIUBAH MENJADI ONSUBMIT 👇 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BAGIAN 1: PILIH AVATAR */}
          <div>
              <label className="text-sm font-bold text-gray-700 block mb-3">Pilih Avatar Kamu</label>
              
              <div className="grid grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((url, index) => (
                      <div 
                        key={index} 
                        onClick={() => setSelectedAvatar(url)}
                        className={`
                            relative aspect-square rounded-full cursor-pointer transition-all duration-200 group bg-gray-50 overflow-hidden border border-gray-100
                            ${selectedAvatar === url 
                                ? "ring-4 ring-emerald-500 scale-105" 
                                : "ring-1 ring-gray-200 hover:ring-emerald-300 hover:scale-105"
                            }
                        `}
                      >
                          <img 
                            src={url} 
                            alt={`Avatar ${index + 1}`} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Img';
                            }}
                          />
                          
                          {/* Icon Centang jika dipilih */}
                          {selectedAvatar === url && (
                              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                  <CheckCircle2 size={12} strokeWidth={4} />
                              </div>
                          )}
                      </div>
                  ))}
              </div>
              
              {/* Input Tersembunyi untuk mengirim URL ke Server Action */}
              <input type="hidden" name="avatar_url" value={selectedAvatar} />
          </div>

          {/* BAGIAN 2: INPUT NAMA */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Nama Tampilan</label>
            <input 
              name="username" 
              defaultValue={user?.username || ""} 
              placeholder="Contoh: Hamba Allah"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium placeholder:text-gray-400"
              required
              maxLength={20}
              autoComplete="off"
            />
            <p className="text-xs text-gray-400 text-right">Maksimal 20 karakter</p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={saving}
            className={`
              w-full font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300
              ${saving 
                ? "bg-emerald-500 text-emerald-50 cursor-not-allowed opacity-90 scale-[0.98]" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98]"
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan Perubahan
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  )
}