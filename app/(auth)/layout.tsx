export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* Hapus bg-gray-50, py-12, dan max-w-md agar LoginPage 
      bisa mengontrol penuh background gradasi dan ukuran layar 
    */
    <div className="min-h-screen w-full">
        {children}
    </div>
  )
}