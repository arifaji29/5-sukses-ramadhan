export default function Loading() {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm">
      <div className="animate-pulse flex flex-col items-center gap-5">
        
        {/* Tempat Logo */}
        <div className="w-24 h-24 relative overflow-hidden rounded-full border-2 border-emerald-100 bg-white flex items-center justify-center">
            <img 
                src="/logo1.png" 
                alt="5 Sukses Ramadhan" 
                className="w-23 h-23 object-contain drop-shadow-sm" 
            />
        </div>
        
        {/* Teks Loading */}
        <div className="flex flex-col items-center gap-1 mt-2">
           <h2 className="text-emerald-800 font-black text-xl tracking-wide">5 SUKSES</h2>
           <p className="text-emerald-600 text-[10px] font-bold tracking-widest uppercase">RAMADHAN</p>
        </div>
        
        {/* Titik Tiga Animasi Loading */}
        <div className="mt-4 flex gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>

      </div>
    </div>
  )
}