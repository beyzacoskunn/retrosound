"use client"

import { useState, use, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Image as ImageIcon, Share2 } from "lucide-react"
import { getCD, type CD } from "@/lib/store"

interface PageProps {
  params: Promise<{ id: string }>
}

// --- YARDIMCI FONKSİYONLAR ---

// URL'deki veriyi güvenli bir şekilde çözmek için (Base64 -> JSON)
function decodeAlbumData(encodedData: string): CD | null {
  try {
    const decoded = decodeURIComponent(atob(encodedData))
    return JSON.parse(decoded)
  } catch (e) {
    return null
  }
}

function getYouTubeEmbedUrl(url: string) {
  if (!url) return ""
  try {
    const urlObj = new URL(url)
    let videoId = urlObj.searchParams.get("v") || url.split("youtu.be/")[1]?.split("?")[0]
    
    // Tarayıcı ve mobil uyumluluğu için gerekli parametreler
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&rel=0`
  } catch (e) { return url }
}
// --- ORTAK PLAK BİLEŞENİ ---
function VinylRecord({ color, isPlaying = false }: { color: string, isPlaying?: boolean }) {
  return (
    <motion.div
      animate={{ rotate: isPlaying ? 360 : 0 }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      className="w-full h-full rounded-full relative flex items-center justify-center bg-[#1A1A1A] border-[4px] border-[#2A2A2A] shadow-2xl"
    >
      <div className="absolute w-[90%] h-[90%] rounded-full border border-white/10"></div>
      <div className="absolute w-[75%] h-[75%] rounded-full border border-white/5"></div>
      <div 
        className="w-[35%] h-[35%] rounded-full flex flex-col items-center justify-center relative shadow-inner overflow-hidden"
        style={{ backgroundColor: color || "#e0dcd3" }}
      >
        <div className="w-full h-1/2 bg-white/20 absolute top-0"></div>
        <div className="absolute m-auto w-2.5 h-2.5 bg-[#E6E6E6] rounded-full z-20"></div>
      </div>
    </motion.div>
  )
}

export default function CDPage({ params }: PageProps) {
  const { id } = use(params)
  const [cd, setCd] = useState<CD | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false) 
  const playerRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Önce URL'deki ID'nin bir paylaşım datası olup olmadığını kontrol et
    const sharedData = decodeAlbumData(id)
    
    if (sharedData) {
      setCd(sharedData)
    } else {
      // Eğer data değilse normal store'dan ara
      const foundCD = getCD(id)
      if (foundCD) setCd(foundCD)
    }
    setIsLoading(false)
  }, [id])

  const togglePlay = () => {
    const nextState = !isPlaying
    setIsPlaying(nextState)
    if (playerRef.current?.contentWindow) {
      const command = nextState ? "playVideo" : "pauseVideo"
      playerRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: command, args: [] }), "*")
    }
  }

  // PAYLAŞIM FONKSİYONU
  const shareAlbum = () => {
    if (!cd) return
    try {
      const jsonStr = JSON.stringify(cd)
      const encoded = btoa(encodeURIComponent(jsonStr))
      const shareUrl = `${window.location.origin}/cd/${encoded}`
      
      navigator.clipboard.writeText(shareUrl)
      alert("Paylaşım linki kopyalandı! Artık herkes bu linkle senin albümünü görebilir.")
    } catch (e) {
      alert("Link oluşturulurken bir hata oluştu.")
    }
  }

  if (isLoading || !cd) return <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center font-mono">LOADING DISC...</div>

  const embedUrl = getYouTubeEmbedUrl(cd.playlistUrl)

  return (
    <div className="min-h-screen bg-[#E6E6E6] text-black flex items-center justify-center p-8 selection:bg-black selection:text-white relative overflow-hidden">
      
      {/* ARKA PLAN IŞIKLARI */}
      <motion.div animate={{ opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.2 }} transition={{ repeat: Infinity, duration: 10 }} className="absolute top-[-15%] left-[-15%] w-[50vw] h-[50vw] rounded-full blur-[80px] pointer-events-none z-0" style={{ backgroundColor: cd.color || "#cccccc" }} />

      {/* PAYLAŞ BUTONU (Sağ Üstte) */}
      <button 
        onClick={shareAlbum}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-white/20 rounded-full shadow-sm hover:bg-white/60 transition-all text-xs font-bold tracking-widest"
      >
        <Share2 size={16} /> PAYLAŞ
      </button>

      {/* ANA KONTEYNER */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-62 z-10 max-w-6xl w-full">
        
        {/* SOL BLOK: BAŞLIK + KAPAK */}
        <div className="flex flex-col items-center gap-6 shrink-0">
          <div className="relative px-6 py-2">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md border border-white/20 rounded-full shadow-sm -rotate-1"></div>
            <h1 className="relative text-2xl md:text-3xl font-black tracking-tighter text-center uppercase text-black/80 drop-shadow-sm">
              {cd.title}
            </h1>
          </div>

          <div className="relative w-[280px] h-[280px] md:w-[300px] md:h-[300px] flex items-center justify-center group">
            <div className="absolute w-[85%] h-[85%] z-0 transition-transform duration-700 ease-out translate-x-[40%] opacity-90 group-hover:translate-x-[50%]">
              <VinylRecord color={cd.color} isPlaying={false} />
            </div>
            <div className="relative z-10 w-full h-full bg-white rounded-md shadow-[15px_0_40px_rgba(0,0,0,0.2)] border border-gray-300 overflow-hidden">
              {cd.coverImage ? (
                <img src={cd.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5] text-gray-400">
                  <ImageIcon size={40} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ BLOK: ÇALAR + BUTON */}
        <div className="flex flex-col items-center lg:mt-[68px] shrink-0">
          <div className="w-[280px] h-[280px] md:w-[300px] md:h-[300px] bg-gradient-to-br from-[#fdfdfd] to-[#c4c4c4] rounded-2xl p-4 shadow-xl border border-white relative mb-8 backdrop-blur-sm">
            <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner" />
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner" />
            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner" />
            <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner" />

            <div className="absolute inset-0 m-auto w-[85%] h-[85%] relative">
                <VinylRecord color={cd.color} isPlaying={isPlaying} />
            </div>

            <div 
              className="absolute top-10 right-10 w-2.5 h-28 bg-gradient-to-r from-gray-200 to-gray-400 origin-top transform transition-transform duration-700 rounded-full shadow-lg border border-gray-400 z-10"
              style={{ transform: isPlaying ? 'rotate(25deg)' : 'rotate(0deg)' }}
            >
              <div className="absolute bottom-[-8px] left-[-5px] w-4 h-8 bg-gray-400 rounded-sm shadow-md" />
            </div>
          </div>

          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
        </div>

      </div>

      <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        {embedUrl && <iframe ref={playerRef} src={embedUrl} allow="autoplay" />}
      </div>
    </div>
  )
}