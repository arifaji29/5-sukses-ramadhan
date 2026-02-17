import { createClient } from '@/lib/supabase/server'

export default async function TestDBPage() {
  // 1. Inisialisasi client Supabase
  const supabase = await createClient()

  // 2. Coba ambil data dari tabel 'profiles'
  // Walaupun datanya kosong, kalau koneksi sukses, 'error' akan bernilai null
  const { data, error } = await supabase.from('profiles').select('*')

  // 3. Tampilkan hasil
  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Cek Koneksi Supabase</h1>
      
      <div className="border p-4 rounded-lg bg-gray-100">
        {error ? (
          // Jika Gagal
          <div className="text-red-600">
            <h2 className="font-bold">❌ Koneksi Gagal!</h2>
            <p>Pesan Error: {error.message}</p>
            <p className="text-sm mt-2 text-gray-600">
              Cek kembali file .env.local Anda, pastikan URL dan ANON KEY sudah benar.
            </p>
          </div>
        ) : (
          // Jika Sukses
          <div className="text-green-600">
            <h2 className="font-bold">✅ Koneksi Sukses!</h2>
            <p>Berhasil terhubung ke Supabase.</p>
            <p className="text-black mt-2">
              Jumlah data di tabel profiles: <strong>{data?.length || 0}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (Wajar jika jumlahnya 0, karena belum ada user yang mendaftar).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}