"use client"

import { useState } from "react"
import RotatingCD from "@/app/components/RotatingCD"
import type { CD } from "@/lib/store"

interface CDViewProps {
  cd: CD
}

export default function CDView({ cd }: CDViewProps) {
  const [isPlaying, setIsPlaying] = useState(true)

  const embedUrl = cd.playlistUrl.replace(
    "open.spotify.com/playlist/",
    "open.spotify.com/embed/playlist/"
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff]">
      <h1 className="text-4xl mb-6 font-retro text-[#CC5500]">{cd.title}</h1>
      <RotatingCD color={cd.color} isPlaying={isPlaying} />
      <div className="mt-8 flex gap-4">
        <button
          className="px-6 py-3 bg-[#C97B36] text-white rounded-full shadow-lg hover:scale-105 transition"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <iframe
        src={embedUrl}
        width={0}
        height={0}
        style={{ display: "none" }}
        allow="encrypted-media"
      />
    </div>
  )
}
