"use client"

import { useState } from "react"
import Spline from "@splinetool/react-spline"
import { motion, AnimatePresence } from "framer-motion"
import { Disc3 } from "lucide-react"
// Eğer CDDesigner component'inin yolu farklıysa burayı güncellemeyi unutma:
import CDDesigner from "./components/CDDesigner" 

export default function LandingPage() {
  const [isEntering, setIsEntering] = useState(false)
  const [showDesigner, setShowDesigner] = useState(false)

  const handleEnter = () => {
    setIsEntering(true)
    
    // Zoom animasyonu (1.5 saniye) bittikten sonra CDDesigner sayfasını göster
    setTimeout(() => {
      setShowDesigner(true)
    }, 1500)
  }

  // Eğer içeri girdiysek, 3D odayı yok edip direkt gümüş tasarım panelimizi gösteriyoruz
  if (showDesigner) {
    return <CDDesigner />
  }

  return (
    <div className="relative w-screen h-screen bg-[#E6E6E6] overflow-hidden selection:bg-black selection:text-white">
      
      {/* 3D Spline Odası ve Zoom Efekti */}
      <motion.div
        className="absolute top-8 inset-0 w-full h-full cursor-grab active:cursor-grabbing "
        animate={isEntering ? { scale: 3.5, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Senin bulduğun Spline sahnesini buraya koyduk! */}
        <Spline scene="https://prod.spline.design/zO18e8kRPnoIZbHq/scene.splinecode" />
      </motion.div>

      {/* Ön Plan: Tabela ve Buton */}
      <AnimatePresence>
        {!isEntering && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-between py-20 pointer-events-none"
          >
            {/* Üst Tabela */}
            <div className="text-center z-10">
              <h1 className="text-5xl md:text-7xl font-mono font-black tracking-tighter text-black drop-shadow-lg">
                RECORD STORE
              </h1>
              <div className="inline-block bg-black text-white text-xs px-4 py-1.5 rounded-full mt-3 font-mono font-bold tracking-[0.2em] shadow-lg">
                INTERACTIVE 3D STUDIO
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              onClick={handleEnter}
              className="pointer-events-auto bg-black text-white px-8 py-4 rounded-xl font-mono font-black tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-10 group"
            >
              <Disc3 className="group-hover:animate-spin transition-transform duration-500" />
              ENTER STUDIO
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yükleniyor Uyarısı (Arka planda bekler) */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 font-mono text-black/40 tracking-widest text-sm font-bold">
        LOADING 3D SCENE...
      </div>
    </div>
  )
}