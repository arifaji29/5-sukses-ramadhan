'use client'

import { saveZakatProgress, resetZakat } from "@/app/(dashboard)/zakat/actions"
import { Upload, CheckCircle, Wallet, Package, Image as ImageIcon, Loader2, Trash2, Camera } from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"
import imageCompression from 'browser-image-compression'

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
  const [compressedFile, setCompressedFile] = useState<File | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))

      const options = {
        maxSizeMB: 0.25, 
        maxWidthOrHeight: 800,
        // PENTING: Matikan web worker untuk mencegah crash di Chrome/Safari Mobile
        useWebWorker: false, 
      }

      try {
        const compressedBlob = await imageCompression(file, options)
        const compressed = new File([compressedBlob], file.name, {
            type: compressedBlob.type,
            lastModified: Date.now(),
        })
        setCompressedFile(compressed) 
      } catch (error) {
        console.error("Gagal kompresi:", error)
        alert("Gagal memproses foto. Silakan coba foto lain.")
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() 
    const formData = new FormData(e.currentTarget)

    if (compressedFile) {
        formData.set('proof', compressedFile)
    }

    startTransition(async () => {
        try {
            await saveZakatProgress(formData)
        } catch (error) {
            console.error("Gagal simpan:", error)
            alert("Gagal menyimpan data. Pastikan koneksi stabil dan ukuran foto tidak terlalu besar.")
        }
    })
  }

  const handleDelete = () => {
    if(!confirm("Yakin ingin menghapus data zakat ini?")) return
    startTransition(async () => {
        await resetZakat()
        setPreview(null)
        setCompressedFile(null)
    })
  }

  // --- TAMPILAN JIKA SUDAH LUNAS ---
  if (data?.is_paid) {
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
                        {isBeras ? <Package size={16} className="text-emerald-500" /> : <Wallet size={16} className="text-emerald-500" />}
                        {isBeras ? 'Beras (2.7 Kg)' : 'Titip Uang'}
                    </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Diterima Oleh</span>
                    <span className="font-bold text-gray-800 truncate max-w-50">{data.notes || "-"}</span>
                </div>
                
                {data.proof_url && (
                    <div className="pt-2">
                        <span className="text-gray-500 font-medium block mb-2">Bukti Foto:</span>
                        <div className="relative aspect-4/5 w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-md">
                            <Image 
                                src={data.proof_url} 
                                alt="Bukti Zakat" 
                                fill 
                                unoptimized
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

  // --- TAMPILAN FORM BAYAR ---
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        
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
                        <span className="text-sm font-bold text-gray-600 peer-checked:text-emerald-800">Beras (2.7 Kg)</span>
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
                placeholder="Nama Amil Zakat / Petugas yang menerima" 
                className="w-full border-2 border-gray-200 bg-gray-50 text-gray-900 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                required
            />
        </div>

        {/* Upload Foto */}
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block uppercase tracking-wider">Foto Bukti (Opsional)</label>
            
            <div className="relative group cursor-pointer">
                <input 
                    type="file" 
                    name="proof" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                <div className={`
                    border-2 border-dashed rounded-xl p-6 transition-all min-h-50 flex flex-col items-center justify-center text-center
                    ${preview 
                        ? 'border-emerald-300 bg-emerald-50/30' 
                        : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-emerald-400'
                    }
                `}>
                    {preview ? (
                        <div className="relative aspect-4/5 w-full max-w-50 rounded-lg overflow-hidden shadow-md border border-gray-200 group-hover:opacity-90 transition-opacity">
                            <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Camera size={28} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors">
                                    Ambil Foto Bukti
                                </p>
                                <p className="text-xs text-gray-400 mt-1 max-w-50 mx-auto leading-relaxed">
                                    Klik untuk membuka kamera HP atau pilih dari galeri
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {isPending ? "Menyimpan..." : "Simpan & Tandai Lunas"}
        </button>

    </form>
  )
}