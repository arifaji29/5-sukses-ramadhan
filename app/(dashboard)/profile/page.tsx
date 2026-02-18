'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateProfile } from "./actions"
import { Save, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// --- KONFIGURASI AVATAR LOKAL ---
// Pastikan Anda sudah menaruh gambar di folder: public/avatars/
const AVATAR_OPTIONS = [
  // --- LAKI-LAKI (6 Gambar) ---
  "/avatars/pria-1.png",
  "/avatars/pria-2.png",
  "/avatars/pria-3.png",
  "/avatars/pria-4.png",
 
  
  // --- PEREMPUAN (6 Gambar) ---
  "/avatars/wanita-1.png",
  "/avatars/wanita-2.png",
  "/avatars/wanita-3.png",
  "/avatars/wanita-4.png",
  
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State untuk avatar yang dipilih
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setUser(profile)
        // Set avatar saat ini sebagai default selection
        if (profile?.avatar_url) {
            setSelectedAvatar(profile.avatar_url)
        }
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setSaving(true)
    try {
      await updateProfile(formData)
      // Redirect langsung ke Dashboard setelah sukses
      router.push('/') 
      router.refresh()
    } catch (error) {
      alert("Gagal memperbarui profil.")
    } finally {
      setSaving(false)
    }
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
            <p className="text-xs text-gray-500">Pilih karakter yang sesuai denganmu</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 p-6">
        <form action={handleSubmit} className="space-y-8">
          
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
                            // Tambahkan error handling sederhana jika gambar belum ada
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
            />
            <p className="text-xs text-gray-400 text-right">Maksimal 20 karakter</p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Simpan Perubahan
          </button>

        </form>
      </div>
    </div>
  )
}