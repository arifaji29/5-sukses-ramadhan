'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveZakatProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // 1. AMBIL DATA DARI FORM
  // 'paymentMethod' harus sama persis dengan attribute name di input radio ZakatForm.tsx
  const rawMethod = formData.get('paymentMethod')
  const notes = formData.get('notes') as string
  const file = formData.get('proof') as File | null
  
  // FIX: Pastikan nilai diambil dengan benar. 
  // Jika user pilih beras, rawMethod isinya "beras". Kita force lowercase agar aman.
  const paymentMethod = rawMethod ? rawMethod.toString().toLowerCase() : 'uang'

  let proofUrl = null

  // 2. LOGIKA UPLOAD FOTO (Jika ada file)
  if (file && file.size > 0) {
    // Sanitasi nama file (hapus spasi agar aman di URL)
    const fileName = `${user.id}-${Date.now()}-${file.name.replace(/\s/g, '_')}`
    
    const { error: uploadError } = await supabase
      .storage
      .from('zakat-proofs') // Pastikan bucket 'zakat-proofs' sudah dibuat di Supabase Storage public
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Opsional: Throw error atau lanjut simpan data tanpa foto
      // throw new Error('Gagal mengupload bukti foto.')
    } else {
        // Dapatkan URL publik hanya jika upload sukses
        const { data } = supabase
          .storage
          .from('zakat-proofs')
          .getPublicUrl(fileName)
          
        proofUrl = data.publicUrl
    }
  }

  // 3. SIAPKAN DATA UNTUK DISIMPAN
  const updateData: any = {
    user_id: user.id,
    is_paid: true, 
    payment_date: new Date().toISOString(),
    payment_method: paymentMethod, // Data yang sudah fix (beras/uang)
    notes: notes,
    // updated_at: new Date().toISOString() // PENTING: Hapus baris ini jika kolom updated_at tidak ada di database Anda
  }

  // Hanya update kolom proof_url jika ada file baru yang diupload
  // (Agar jika user edit data tapi tidak ganti foto, foto lama tidak hilang/jadi null)
  if (proofUrl) {
    updateData.proof_url = proofUrl
  }

  // 4. EKSEKUSI KE DATABASE
  const { error } = await supabase
    .from('zakat_fitrah_progress')
    .upsert(updateData, { onConflict: 'user_id' })

  if (error) {
      console.error("Database Error:", error)
      throw new Error("Gagal menyimpan data zakat. Pastikan kolom database sesuai.")
  }

  revalidatePath('/zakat')
  revalidatePath('/') // Refresh dashboard utama juga agar widget zakat terupdate
}

// Fungsi Reset (Batal Bayar/Hapus Data)
export async function resetZakat() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    const { error } = await supabase
      .from('zakat_fitrah_progress')
      .delete()
      .eq('user_id', user.id)
  
    if (error) throw new Error(error.message)
    
    revalidatePath('/zakat')
    revalidatePath('/')
}