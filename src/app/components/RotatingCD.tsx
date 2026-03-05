"use client"

import { motion } from "framer-motion"

interface RotatingCDProps {
  color: string
  isPlaying: boolean
  title?: string
}

export default function RotatingCD({ color, isPlaying, title = "Mixtape" }: RotatingCDProps) {
  return (
    <motion.div
      animate={{ rotate: isPlaying ? 360 : 0 }}
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: color }}
    >
      {/* Plak / CD Çizgileri ve Holografik Yansıma */}
      <div 
        className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay"
        style={{
          background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.8) 15%, transparent 30%, transparent 50%, rgba(255,255,255,0.8) 65%, transparent 80%)"
        }}
      />
      <div className="absolute inset-0 rounded-full border-[1px] border-black/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />

      {/* CD Etiketi (İçteki Beyaz/Krem Alan) */}
      <div className="absolute w-3/5 h-3/5 rounded-full bg-[#fdfbf7] shadow-lg flex flex-col items-center justify-start pt-6 border-4 border-black/20">
        <span className="text-black/80 font-bold text-lg md:text-xl tracking-widest uppercase text-center w-3/4 truncate">
          {title || "MIXTAPE"}
        </span>
        <div className="w-full h-[1px] bg-black/20 mt-2" />
      </div>

      {/* CD Merkezi (Delik) */}
      <div className="absolute w-12 h-12 bg-black/90 rounded-full border-4 border-white/30 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] z-10" />
      
      {/* Şeffaf İç Plastik Halka */}
      <div className="absolute w-16 h-16 rounded-full border-2 border-white/10 mix-blend-screen z-10" />
    </motion.div>
  )
}