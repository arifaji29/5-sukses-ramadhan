import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/cron (cron jobs) <-- PENTING: Agar cron job tidak kena redirect login
     * - skip (halaman auto-login guest) <-- BARU: Agar auto-login bisa diakses
     * - images extensions (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/cron|skip|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}