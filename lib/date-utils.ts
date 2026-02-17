// src/lib/date-utils.ts

export function getWIBDate() {
  const now = new Date();
  
  // 1. Ambil waktu UTC murni (detik sejak 1970)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  
  // 2. Tambahkan offset WIB (UTC + 7 jam)
  // 7 jam * 60 menit * 60 detik * 1000 milidetik
  const wibTime = new Date(utc + (7 * 3600000));
  
  return wibTime;
}

export function getHijriDate() {
  const today = getWIBDate(); // Pakai fungsi WIB kita
  const currentHour = today.getHours(); // Ini pasti jam WIB (0-23)
  
  // Logika pergantian hari setelah Maghrib (jam 18.00)
  const isAfterMaghrib = currentHour >= 18;
  
  // ... (lanjutkan logika tanggal hijriyah Anda disini)
  // Contoh sederhana:
  // const ramadhanStart = new Date("2026-02-17"); // Sesuaikan tgl mulai
  // const diffTime = Math.abs(today.getTime() - ramadhanStart.getTime());
  // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  // return isAfterMaghrib ? diffDays + 1 : diffDays;
}