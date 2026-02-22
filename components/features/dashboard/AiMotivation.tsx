import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi Gemini (Hanya berjalan di Server)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AiMotivationProps {
  userName: string;
  totalPoints: number;
}

export default async function AiMotivation({ userName, totalPoints }: AiMotivationProps) {
  // 1. Pesan Default (Muncul jika AI sedang error / limit)
  let motivationMessage = "Yuk, selesaikan challenge 5 Sukses Ramadhan dan kumpulkan poin kebaikan sebanyak-banyaknya! 🚀";

  try {
    // 2. Panggil AI jika API Key tersedia
    if (process.env.GEMINI_API_KEY) {
      // Menggunakan Gemini 1.5 Flash karena sangat cepat dan ringan
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // PROMPT RAHASIA: Cara kita menyuruh AI
      // PROMPT RAHASIA: Cara kita menyuruh AI
      const prompt = `
        Kamu adalah asisten cerdas di aplikasi "5 Sukses Ramadhan". 
        Tugasmu: Berikan 1 kalimat pendek (maksimal 20 kata) berisi TIPS CARA MENDAPATKAN POIN untuk user bernama "${userName}" (Poin saat ini: ${totalPoints}).
        
        Pilih HANYA SALAH SATU dari daftar tips berikut secara acak untuk diucapkan:
        - Centang puasa harian dapat 3 poin.
        - Tarawih di masjid dapat 2 poin (lebih besar dari di rumah lho!).
        - Selesaikan baca 1 Juz dapat 5 poin.
        - Khatam Al-Qur'an dapat bonus besar 153 poin.
        - I'tikaf di malam ganjil dapat 4 poin. Persiapkan dari sekarang karena waktunya kurang (sebutkan kurang berapa hari lagi)
        - Jangan lupa catat Zakat Fitrah untuk dapat 30 poin. (ingatkan ini di 7 hari terakhir ramadhan)
        
        Gaya bahasa: Santai, asik, seperti ngobrol dengan teman. Wajib sertakan 1 emoji. Jangan pakai tanda kutip di awal/akhir.
      `;
      
      const result = await model.generateContent(prompt);
      const aiText = result.response.text().trim();
      
      if (aiText) {
          motivationMessage = aiText;
      }
    }
  } catch (error) {
    console.error("Gagal mengambil motivasi AI:", error);
    // Jika gagal, tidak akan error di layar, melainkan akan memakai pesan default tadi
  }

  return (
    <p className="text-emerald-100 text-sm leading-relaxed animate-in fade-in duration-700">
        {motivationMessage}
    </p>
  );
}