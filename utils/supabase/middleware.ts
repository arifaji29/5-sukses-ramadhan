import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Buat response awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inisialisasi Supabase Client untuk Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Cek User yang sedang login
  // PENTING: Jangan gunakan getSession() di middleware karena tidak aman, gunakan getUser()
  const { data: { user } } = await supabase.auth.getUser()

  // 4. LOGIKA PROTEKSI ROUTE
  
  // Daftar halaman yang BOLEH diakses tanpa login (Public Routes)
  const publicRoutes = ['/login', '/register', '/auth']
  
  // Cek apakah URL yang diminta adalah public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Skenario A: User BELUM Login, tapi mencoba akses halaman Private (Dashboard, Puasa, dll)
  if (!user && !isPublicRoute) {
    // Redirect paksa ke halaman login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Skenario B: User SUDAH Login, tapi mencoba akses halaman Login/Register
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    // Redirect paksa ke dashboard (halaman utama)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}