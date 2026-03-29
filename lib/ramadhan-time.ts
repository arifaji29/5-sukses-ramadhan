// src/lib/ramadhan-time.ts

// ============================================================================
// 1. SISTEM PENANGGALAN HIJRIAH DINAMIS (FULL YEAR)
// ============================================================================

// KUNCI RUKYATUL HILAL: Variabel ini untuk penyesuaian manual (Sidang Isbat)
// 0  = Sesuai hitungan kalender standar (Umm al-Qura)
// +1 = Mundur 1 hari (Misal bulan sebelumnya digenapkan 30 hari / Istikmal)
// -1 = Maju 1 hari 
export const HIJRI_OFFSET = -1; 

/**
 * Menghasilkan tanggal Hijriah dinamis berdasarkan waktu saat ini,
 * mempertimbangkan pergantian hari saat Maghrib dan hasil Sidang Isbat.
 */
export function getDynamicHijriDate(inputDate: Date = new Date()): string {
    // 1. Clone tanggal agar tidak merubah referensi asli
    const targetDate = new Date(inputDate.getTime());

    // 2. LOGIKA SYARIAT (PERGANTIAN HARI SAAT MAGHRIB)
    // Jika sudah lewat jam 18:00 (Maghrib), maka secara Hijriah sudah masuk hari esok
    const maghribHour = 18; 
    if (targetDate.getHours() >= maghribHour) {
        targetDate.setDate(targetDate.getDate() + 1); 
    }

    // 3. PENYESUAIAN RUKYATUL HILAL (SIDANG ISBAT)
    targetDate.setDate(targetDate.getDate() + HIJRI_OFFSET);

    // 4. Konversi ke Hijriah menggunakan API bawaan Browser/Node.js
    // 'id-TN-u-ca-islamic-umalqura' memastikan format Bahasa Indonesia & kalender Umm al-Qura
    const hijriString = new Intl.DateTimeFormat('id-TN-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(targetDate);

    return hijriString; // Output: "1 Syawal 1447", "10 Dzulhijjah 1447", dll.
}


// ============================================================================
// 2. FUNGSI KHUSUS RAMADHAN (Legacy - Dipertahankan agar app tidak error)
// ============================================================================

export const RAMADHAN_START_DATE_STR = "2026-02-19T00:00:00"; 
export const RAMADHAN_START = new Date(RAMADHAN_START_DATE_STR);
export const RAMADHAN_DAYS_TOTAL = 30;

export function getCurrentRamadhanDay() {
  const now = new Date();
  const start = new Date(RAMADHAN_START_DATE_STR);
  
  const diffTime = now.getTime() - start.getTime();
  let day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const maghribHour = 18; 
  if (now.getHours() >= maghribHour) {
      day += 1; 
  }
  
  return day;
}

export function getRamadhanPhase() {
    const day = getCurrentRamadhanDay();
    if (day <= 0) return "Menunggu Ramadhan";
    if (day <= 10) return "10 Hari Pertama (Rahmat)";
    if (day <= 20) return "10 Hari Kedua (Maghfirah)";
    if (day <= 30) return "10 Hari Terakhir (Itqun Minan Nar)";
    return "Idul Fitri / Syawal";
}

export function getZakatDeadline() {
    const start = new Date(RAMADHAN_START_DATE_STR);
    const deadline = new Date(start);
    
    // Menggunakan (RAMADHAN_DAYS_TOTAL - 1) agar otomatis menyesuaikan
    // Jika 30 hari -> 30 - 1 = 29 hari dari tanggal mulai
    // Jika 29 hari -> 29 - 1 = 28 hari dari tanggal mulai
    deadline.setDate(start.getDate() + (RAMADHAN_DAYS_TOTAL - 1)); 
    
    // Set ke pukul 23:59:59 (Batas akhir hari tersebut)
    deadline.setHours(23, 59, 59); 
    return deadline;
}

export function getLailatulQadarStartDate() {
    const start = new Date(RAMADHAN_START_DATE_STR);
    const date21 = new Date(start);
    date21.setDate(start.getDate() + 19); 
    date21.setHours(18, 0, 0); 
    return date21;
}