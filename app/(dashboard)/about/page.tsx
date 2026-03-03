'use client'

import { Info, Sun, Moon, BookOpen, Star, CheckCircle, Mail, Sparkles, Heart, Send, Loader2 } from "lucide-react"
import { useState } from "react"

export default function AboutPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Fungsi untuk menangani saat form dikirim
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const form = e.currentTarget
        const data = new FormData(form)

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            })
            
            if (response.ok) {
                setIsSuccess(true)
                form.reset() // Bersihkan isi form setelah berhasil
            } else {
                alert("Waduh, gagal mengirim pesan. Silakan coba lagi nanti.")
            }
        } catch (error) {
            alert("Terjadi kesalahan jaringan. Periksa koneksi internet Anda.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* SECTION 1: HEADER & TUJUAN */}
            <div className="bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 opacity-5 -mr-10 -mt-10 pointer-events-none">
                    <Info size={300} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="bg-white/10 p-4 rounded-2xl shrink-0 backdrop-blur-sm border border-white/20">
                        <Sparkles size={48} className="text-yellow-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                            Tentang Aplikasi 
                        </h1>
                        <p className="text-indigo-100 leading-relaxed md:text-lg text-justify mb-4">
                            Aplikasi <strong className="text-yellow-300">5 Sukses Ramadhan</strong> dibuat dengan tujuan untuk memotivasi pengguna untuk ikut mensukseskan 5 Sukses Ramadhan <strong className="text-yellow-300"> (Sukses Puasa, Sukses Tarawih, Sukses Tadarus Al-Qur'an, Sukses Lailatul Qadar, dan Sukses Zakat Fitrah) </strong> serta mencari pahala sebanyak banyak di bulan ramadhan dengan cara yang menyenangkan.
                        </p>
                        <p className="text-indigo-100 leading-relaxed md:text-lg text-justify mb-4">
                            Melalui sistem poin (gamifikasi) dan tracking progress yang jelas, kami berharap aplikasi ini 
                            bisa menjadi teman setia Anda dalam menjaga konsistensi beribadah di bulan Ramadhan. Yuk, maksimalkan pahala kita tahun ini!
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION 2: FITUR & MENU */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full"/>
                    Menu & Fitur Utama
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fitur 1 */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                        <div className="bg-orange-100 text-orange-600 p-3 rounded-xl h-fit shrink-0">
                            <Sun size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-1">1. Sukses Puasa</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Catat puasa harian Anda dengan mudah. Usahakan puasa penuh sebulan untuk mendapatkan poin maksimal.
                            </p>
                        </div>
                    </div>

                    {/* Fitur 2 */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                        <div className="bg-violet-100 text-violet-600 p-3 rounded-xl h-fit shrink-0">
                            <Moon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-1">2. Sukses Tarawih</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Lacak ibadah tarawih Anda setiap malam. Anda akan mendapatkan poin ekstra jika sholat berjamaah di Masjid.
                            </p>
                        </div>
                    </div>

                    {/* Fitur 3 */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl h-fit shrink-0">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-1">3. Sukses Tadarus</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Pantau bacaan Al-Qur'an Anda dari Juz 1 hingga 30. Kejar target khatam Anda dan dapatkan bonus poin besar!
                            </p>
                        </div>
                    </div>

                    {/* Fitur 4 */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                        <div className="bg-amber-100 text-amber-600 p-3 rounded-xl h-fit shrink-0">
                            <Star size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-1">4. Lailatul Qadar</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Maksimalkan ibadah di 10 malam terakhir. Tandai malam I'tikaf Anda, terutama pada malam-malam ganjil.
                            </p>
                        </div>
                    </div>

                    {/* Fitur 5 */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4 md:col-span-2 lg:col-span-1">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl h-fit shrink-0">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-1">5. Sukses Zakat</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Jangan lupakan kewajiban penutup. Tandai jika Anda sudah menunaikan Zakat Fitrah sebelum Idul Fitri tiba.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: KOTAK SARAN (LANGSUNG FORM) */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-emerald-600">
                    <Heart size={150} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-200 text-emerald-700 p-2 rounded-lg">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Kirim Saran & Masukan</h2>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6 max-w-2xl leading-relaxed">
                        Jika Anda menemukan error (bug) atau memiliki ide fitur baru, silakan tulis langsung di bawah ini. Pesan Anda akan langsung terkirim ke tim pengembang.
                    </p>

                    {isSuccess ? (
                        <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 mb-4">
                            <CheckCircle size={24} className="text-emerald-600 shrink-0" />
                            <div>
                                <h4 className="font-bold">Alhamdulillah, Pesan Terkirim!</h4>
                                <p className="text-sm">Terima kasih atas masukan yang sangat berharga untuk pengembangan aplikasi ini.</p>
                            </div>
                        </div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit}
                            // GANTI URL DI BAWAH INI DENGAN URL DARI FORMSPREE
                            action="https://formspree.io/f/xnjbeavv" 
                            method="POST"
                            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-5 max-w-2xl relative z-20"
                        >
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                    Email Anda (Opsional)
                                </label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    placeholder="nama@email.com"
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                                    Pesan / Saran <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    name="message" 
                                    id="message" 
                                    required
                                    rows={4}
                                    placeholder="Tulis pesan Anda di sini..."
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-y"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} /> Kirim Pesan
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <div className="text-center pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-400">
                    Semoga Ramadhan ini menjadi yang terbaik bagi kita semua. <br/><br/>   
                     الحمد لله جزاكم الله خيرا                 
                </p>
            </div>
        </div>
    )
}