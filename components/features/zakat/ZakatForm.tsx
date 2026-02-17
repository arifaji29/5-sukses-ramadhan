'use client'

import { saveZakatProgress, resetZakat } from "@/app/(dashboard)/zakat/actions"
import { Upload, CheckCircle, Wallet, Package, Image as ImageIcon, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"

interface ZakatData {
  is_paid: boolean
  payment_method: string
  notes: string
  proof_url: string | null
  payment_date: string
}

export default function ZakatForm({ data }: { data: ZakatData | null }) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleDelete = () => {
    if(!confirm("Yakin ingin menghapus data zakat ini?")) return
    startTransition(async () => {
        await resetZakat()
        setPreview(null)
    })
  }

  // --- TAMPILAN JIKA SUDAH LUNAS ---
  if (data?.is_paid) {
    // LOGIKA PENTING: Cek 'beras' tanpa peduli huruf besar/kecil
    const method = data.payment_method?.toLowerCase() || ''
    const isBeras = method === 'beras' || method.includes('beras')

    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
                <div className="bg-emerald-100 p-4 rounded-full shadow-inner">
                    <CheckCircle size={64} className="text-emerald-600" />
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-gray-900">الْحَمْدُ لِلَّهِ جَزَاكُمُ اللهُ خَيْرًا</h2>
                <p className="text-gray-600 mt-1 text-sm">Anda telah menunaikan kewajiban Zakat Fitrah.</p>
                <div className="mt-3">
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 inline-flex items-center gap-1">
                        <CheckCircle size={12} />
                        Tercatat: {new Date(data.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl text-left space-y-4 text-sm border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Bentuk Zakat</span>
                    <span className="font-bold text-gray-800 capitalize flex items-center gap-2">
                        {/* Tampilkan Ikon & Teks sesuai isBeras */}
                        {isBeras ? <Package size={16} className="text-emerald-500" /> : <Wallet size={16} className="text-emerald-500" />}
                        {isBeras ? 'Beras 1 Sha (2.7 Kg)' : 'Titip Uang'}
                    </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Diterima Oleh</span>
                    <span className="font-bold text-gray-800 truncate max-w-50">{data.notes || "-"}</span>
                </div>
                
                {data.proof_url && (
                    <div className="pt-2">
                        <span className="text-gray-500 font-medium block mb-2">Bukti Foto:</span>
                        <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <Image 
                                src={data.proof_url} 
                                alt="Bukti Zakat" 
                                fill 
                                className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-500 text-sm hover:text-red-700 hover:bg-red-50 py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 w-full font-medium"
            >
                {isPending ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                Reset / Hapus Data
            </button>
        </div>
    )
  }

  // --- TAMPILAN FORM BAYAR (BELUM LUNAS) ---
  return (
    <form action={saveZakatProgress} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        
        <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-emerald-600" /> Catat Pembayaran
            </h2>
            <p className="text-sm text-gray-500 mt-1">Isi form ini setelah Anda menyerahkan zakat secara langsung.</p>
        </div>

        {/* Pilihan Metode */}
        <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 block uppercase tracking-wider">Bentuk Zakat</label>
            <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer group relative">
                    <input type="radio" name="paymentMethod" value="beras" className="peer sr-only" defaultChecked />
                    <div className="border-2 border-gray-100 peer-checked:border-emerald-500 peer-checked:bg-emerald-50/50 rounded-xl p-4 flex flex-col items-center gap-3 transition-all hover:bg-gray-50 h-full">
                        <div className="bg-gray-100 peer-checked:bg-emerald-100 p-3 rounded-full transition-colors">
                             <Package className="text-gray-400 peer-checked:text-emerald-600" size={24} />
                        </div>
                        <span className="text-sm font-bold text-gray-600 peer-checked:text-emerald-800">Beras 1 Sha (2.7kg)</span>
                        <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-emerald-500 transition-opacity">
                            <CheckCircle size={16} className="fill-emerald-500 text-white"/>
                        </div>
                    </div>
                </label>
                <label className="cursor-pointer group relative">
                    <input type="radio" name="paymentMethod" value="uang" className="peer sr-only" />
                    <div className="border-2 border-gray-100 peer-checked:border-emerald-500 peer-checked:bg-emerald-50/50 rounded-xl p-4 flex flex-col items-center gap-3 transition-all hover:bg-gray-50 h-full">
                        <div className="bg-gray-100 peer-checked:bg-emerald-100 p-3 rounded-full transition-colors">
                             <Wallet className="text-gray-400 peer-checked:text-emerald-600" size={24} />
                        </div>
                        <span className="text-sm font-bold text-gray-600 peer-checked:text-emerald-800">Uang (Titip)</span>
                        <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-emerald-500 transition-opacity">
                            <CheckCircle size={16} className="fill-emerald-500 text-white"/>
                        </div>
                    </div>
                </label>
            </div>
        </div>

        {/* Amil Zakat */}
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block uppercase tracking-wider">Diterima Oleh (Amil)</label>
            <input 
                type="text" 
                name="notes"
                placeholder="Nama Amil / Masjid Pengumpul Zakat" 
                className="w-full border-2 border-gray-200 bg-gray-50 text-gray-900 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                required
            />
        </div>

        {/* Upload Foto */}
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block uppercase tracking-wider">Foto Bukti (Opsional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-emerald-400 transition-all relative group cursor-pointer bg-gray-50/50">
                <input 
                    type="file" 
                    name="proof" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {preview ? (
                    <div className="relative h-48 w-full mx-auto rounded-lg overflow-hidden shadow-sm">
                        <Image src={preview} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <p className="text-white text-sm font-medium flex items-center gap-2">
                                <ImageIcon size={16} /> Ganti Foto
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-400 py-4">
                        <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <ImageIcon size={28} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 group-hover:text-emerald-600 transition-colors">Klik untuk upload foto</p>
                            <p className="text-xs text-gray-400 mt-1">Struk / Foto Serah Terima</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98]"
        >
            <Upload size={20} />
            Simpan & Tandai Lunas
        </button>

    </form>
  )
}