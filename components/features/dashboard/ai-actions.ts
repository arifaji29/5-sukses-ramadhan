"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getAiTipAction(userName: string, totalPoints: number, currentDay: number) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Logika Zakat hanya dimunculkan di 7 hari terakhir (Hari ke-24 s/d 30)
        const zakatTip = currentDay >= 24 
            ? "- Jangan lupa catat Zakat Fitrah untuk dapat 30 poin. Tunaikan sebelum terlambat ya!" 
            : "";

        const prompt = `
            Kamu adalah asisten cerdas di aplikasi "5 Sukses Ramadhan". 
            Tugasmu: Berikan 1 kalimat pendek (maksimal 20 kata) berisi TIPS CARA MENDAPATKAN POIN untuk user bernama "${userName}" (Poin: ${totalPoints}).
            
            Pilih HANYA SALAH SATU dari daftar tips berikut secara acak untuk diucapkan:
            - Centang puasa harian dapat 3 poin.
            - Tarawih di masjid dapat 2 poin (lebih besar dari di rumah lho!).
            - Selesaikan baca 1 Juz dapat 5 poin.
            - Khatam Al-Qur'an dapat bonus besar 153 poin.
            - I'tikaf di malam ganjil dapat 4 poin. Persiapkan dari sekarang ya!
            ${zakatTip}
            
            Gaya bahasa: Santai, asik, seperti ngobrol dengan teman. Wajib sertakan 1 atau 2 emoji. Jangan pakai tanda kutip di awal/akhir.
        `;
        
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("AI Error:", error);
        return "Ups, mesin AI sedang istirahat sebentar. Coba klik lagi nanti ya! 🤖";
    }
}