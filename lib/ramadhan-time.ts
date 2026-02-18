// src/lib/ramadhan-time.ts

// Sesuaikan tanggal mulai sesuai keinginan (contoh: 17 Februari 2026)
export const RAMADHAN_START_DATE_STR = "2026-02-19T00:00:00"; 

export const RAMADHAN_START = new Date(RAMADHAN_START_DATE_STR);
export const RAMADHAN_DAYS_TOTAL = 30;

// FUNGSI UTAMA: MENGHITUNG HARI DENGAN LOGIKA MAGHRIB
export function getCurrentRamadhanDay() {
  const now = new Date();
  const start = new Date(RAMADHAN_START_DATE_STR);
  
  // 1. Hitung selisih hari dasar (Gregorian / Masehi)
  // Ini menghitung jarak hari dari tanggal mulai (pukul 00:00)
  const diffTime = now.getTime() - start.getTime();
  
  // Math.floor digunakan agar hitungan hari bulat ke bawah
  // Ditambah 1 agar hari pertama dihitung "Hari ke-1" bukan "Hari ke-0"
  let day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // 2. LOGIKA SYARIAT (PERGANTIAN HARI SAAT MAGHRIB)
  // Kita asumsikan Maghrib rata-rata pukul 18:00
  // Jika jam sekarang >= 18, maka secara Hijriah sudah masuk hari berikutnya (Malam besok)
  const maghribHour = 18; 
  if (now.getHours() >= maghribHour) {
      day += 1; 
  }

  // 3. Validasi Batas
  // Jika hasilnya < 1 (misal H-1 atau H-2), kita kembalikan 0 atau negatif
  // agar UI bisa menangani status "Belum Mulai"
  
  return day;
}

// Fungsi Status Fase Ramadhan
export function getRamadhanPhase() {
    const day = getCurrentRamadhanDay();
    if (day <= 0) return "Menunggu Ramadhan";
    if (day <= 10) return "10 Hari Pertama (Rahmat)";
    if (day <= 20) return "10 Hari Kedua (Maghfirah)";
    if (day <= 30) return "10 Hari Terakhir (Itqun Minan Nar)";
    return "Idul Fitri / Syawal";
}

// FUNGSI COUNTDOWN ZAKAT (Batas Akhir Malam Takbiran)
export function getZakatDeadline() {
    const start = new Date(RAMADHAN_START_DATE_STR);
    const deadline = new Date(start);
    
    // Batas akhir adalah tanggal 30 Ramadhan saat Maghrib (masuk 1 Syawal)
    // Atau seringkali ditoleransi sampai sebelum Shalat Ied. 
    // Di sini kita set sampai akhir hari ke-30 (sebelum ganti tanggal Masehi besoknya)
    deadline.setDate(start.getDate() + 29); 
    deadline.setHours(23, 59, 59); 
    return deadline;
}

// FUNGSI COUNTDOWN LAILATUL QADAR (Malam 21)
export function getLailatulQadarStartDate() {
    const start = new Date(RAMADHAN_START_DATE_STR);
    
    // Malam 21 dimulai saat Maghrib di hari ke-20 Puasa
    const date21 = new Date(start);
    date21.setDate(start.getDate() + 19); // +19 hari dari tgl 1 (karena Malam 21 ada di sore hari ke-20)
    date21.setHours(18, 0, 0); // Tepat Azan Maghrib
    
    return date21;
}