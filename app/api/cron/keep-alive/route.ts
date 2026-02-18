import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Pastikan route ini tidak di-cache (selalu jalan real-time)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Lakukan query ringan. Misal: hitung jumlah user (atau ambil 1 profil)
    // Kita pakai count saja biar ringan.
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error("Supabase Keep-Alive Error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Supabase Keep-Alive Success. User count: ${count}`)
    
    return NextResponse.json({ 
      message: "Supabase is active!", 
      timestamp: new Date().toISOString(),
      user_count: count 
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}