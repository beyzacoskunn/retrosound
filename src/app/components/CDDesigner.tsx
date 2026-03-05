"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { saveCD } from "@/lib/store"
import { Disc3, Music, PaintBucket, Wrench, Image as ImageIcon, Upload, Crop, X } from "lucide-react"
import Cropper from "react-easy-crop"

// --- KIRPMA (CROP) İŞLEMİ İÇİN YARDIMCI FONKSİYON ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.src = url
  })

async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise<string>((resolve) => {
    canvas.toBlob((file) => {
      if (file) resolve(URL.createObjectURL(file))
    }, "image/jpeg")
  })
}
// ----------------------------------------------------

export default function CDDesigner() {
  const router = useRouter()
  
  // -- Form State'leri --
  const [color, setColor] = useState("#C4C4C4") 
  const [title, setTitle] = useState("")
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null) // Kırpılmış son görsel

  // -- Kırpma (Crop) State'leri --
  const [imageToCrop, setImageToCrop] = useState<string | null>(null) // Yüklenen ham görsel
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const handleCreate = () => {
    if (!playlistUrl) return alert("Please enter a YouTube link!")
    
    const newId = crypto.randomUUID()
    saveCD({ 
      id: newId, 
      color, 
      title: title || "MY MIXTAPE", 
      playlistUrl,
      coverImage 
    })
    router.push(`/cd/${newId}`)
  }

  // Kullanıcı görsel seçtiğinde Modal'ı açar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageToCrop(URL.createObjectURL(file))
    }
    // Aynı dosyayı tekrar seçebilmek için input'u sıfırlıyoruz
    e.target.value = ''
  }

  // Kırpma alanı değiştikçe piksel verilerini kaydeder
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // "Kırp ve Kaydet" butonuna basıldığında
  const showCroppedImage = useCallback(async () => {
    try {
      if (imageToCrop && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels)
        if (croppedImage) {
          setCoverImage(croppedImage)
          setImageToCrop(null) // Kırpma ekranını kapat
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [imageToCrop, croppedAreaPixels])

  return (
    <div className="min-h-screen bg-[#E6E6E6] text-black flex flex-col items-center justify-center p-6 relative font-mono selection:bg-black selection:text-white">
      
      {/* --- KIRPMA EKRANI (MODAL) --- */}
      <AnimatePresence>
        {imageToCrop && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="bg-[#E6E6E6] p-6 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-black tracking-widest text-lg flex items-center gap-2"><Crop size={20}/> CROP ARTWORK</h3>
                <button onClick={() => setImageToCrop(null)} className="p-2 bg-gray-300 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
              </div>
              
              <div className="relative w-full h-[300px] bg-black rounded-xl overflow-hidden border-2 border-gray-400">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // 1:1 KARE ZORUNLULUĞU
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold">ZOOM</span>
                <input 
                  type="range" min={1} max={3} step={0.1} value={zoom} 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className="w-full accent-black"
                />
              </div>

              <button 
                onClick={showCroppedImage}
                className="w-full bg-black text-white py-4 rounded-xl font-black tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                CROP & SAVE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ----------------------------- */}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black drop-shadow-sm">RECORD STORE</h1>
        <div className="inline-block bg-black text-white text-[10px] px-3 py-1 rounded-full mt-2 font-bold tracking-widest">CREATOR MODE</div>
      </motion.div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start z-10">
        
        {/* SOL PANEL: Gümüş Kontrol Paneli */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-[#f5f5f5] to-[#c4c4c4] p-8 rounded-3xl border border-white shadow-[10px_10px_30px_rgba(0,0,0,0.15),-5px_-5px_15px_rgba(255,255,255,0.8),inset_0_0_2px_rgba(0,0,0,0.3)] space-y-6 relative sticky top-6">
          <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-black/70 tracking-widest uppercase"><ImageIcon size={16} /> Cover Art</label>
            <input type="file" accept="image/*" className="hidden" id="cover-upload" onChange={handleFileChange} />
            <label htmlFor="cover-upload" className="flex items-center justify-center gap-2 w-full bg-[#E6E6E6] border-2 border-dashed border-gray-400 rounded-xl p-4 text-gray-500 font-bold tracking-wider hover:bg-white hover:border-black hover:text-black transition-colors cursor-pointer shadow-inner">
              <Upload size={16} />
              {coverImage ? "CHANGE ARTWORK" : "UPLOAD ARTWORK"}
            </label>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-black/70 tracking-widest uppercase"><Disc3 size={16} /> CD Title</label>
            <input className="w-full bg-[#E6E6E6] border-2 border-gray-300 rounded-xl p-4 text-black font-bold tracking-wider placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors shadow-inner" placeholder="e.g. LATE NIGHTS" value={title} maxLength={20} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-black/70 tracking-widest uppercase"><Music size={16} /> YouTube Link</label>
            <input className="w-full bg-[#E6E6E6] border-2 border-gray-300 rounded-xl p-4 text-black font-bold tracking-wider placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors shadow-inner" placeholder="PASTE URL HERE" value={playlistUrl} onChange={(e) => setPlaylistUrl(e.target.value)} />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-black/70 tracking-widest uppercase"><PaintBucket size={16} /> Disc Color</label>
            <div className="flex gap-4 items-center bg-[#E6E6E6] p-3 rounded-xl border-2 border-gray-300 shadow-inner w-full">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shadow-md" />
              <span className="text-black font-bold uppercase tracking-widest text-sm flex-1">{color}</span>
            </div>
          </div>

          <button onClick={handleCreate} className="w-full mt-6 bg-black text-white py-4 rounded-xl font-black tracking-[0.2em] uppercase transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_25px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
            <Wrench size={18} /> Press CD & Play
          </button>
        </motion.div>

        {/* SAĞ PANEL: Canlı Önizleme (Üstte Kapak, Altta Pikap) */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-6 pb-12">
          
          {/* 1. ÜST KISIM: Albüm Kapağı */}
          {coverImage && (
            <div className="w-full max-w-[320px] aspect-square bg-white rounded-md shadow-2xl border border-gray-300 overflow-hidden relative group">
              <img src={coverImage} alt="Album Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>
          )}

          {/* 2. ALT KISIM: Pikap Görünümü */}
          <div className="w-full max-w-[320px] aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#c4c4c4] rounded-2xl p-4 shadow-[10px_10px_30px_rgba(0,0,0,0.15),-5px_-5px_15px_rgba(255,255,255,0.8),inset_0_0_2px_rgba(0,0,0,0.3)] border border-white relative backdrop-blur-sm bg-white/50 z-10">
            <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>
            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>
            <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>

            <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] border-2 border-gray-300">
               <div className="absolute inset-2 rounded-full bg-gray-300 shadow-lg border border-gray-400"></div>
            </div>

            {/* Plak */}
            <div className="absolute inset-0 m-auto w-[85%] h-[85%] bg-[#1A1A1A] rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#2A2A2A]">
              <div className="w-full h-full rounded-full relative flex items-center justify-center">
                <div className="absolute w-[90%] h-[90%] rounded-full border border-white/10"></div>
                <div className="absolute w-[75%] h-[75%] rounded-full border border-white/5"></div>
                <div className="absolute w-[60%] h-[60%] rounded-full border border-white/10"></div>
                
                {/* Canlı Renk Önizlemesi */}
                <div className="w-[35%] h-[35%] rounded-full flex flex-col items-center justify-center relative shadow-inner overflow-hidden transition-colors duration-300" style={{ backgroundColor: color }}>
                  <div className="w-full h-1/2 bg-white/20 absolute top-0"></div>
                  <span className="text-[7px] font-bold text-black mt-4 tracking-widest uppercase max-w-[80%] truncate bg-white/30 px-1 rounded">{title || "MIXTAPE"}</span>
                  <div className="absolute m-auto w-3 h-3 bg-[#E6E6E6] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>
                </div>
              </div>
            </div>

            {/* İğne */}
            <div className="absolute top-12 right-12 w-3 h-32 bg-gradient-to-r from-gray-300 to-gray-400 origin-top rounded-full shadow-[5px_5px_10px_rgba(0,0,0,0.4)] border border-gray-400 z-10 rotate-0">
              <div className="absolute bottom-[-10px] left-[-6px] w-5 h-10 bg-gradient-to-b from-gray-200 to-gray-400 rounded-sm shadow-md flex items-end justify-center pb-1">
                 <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <p className="mt-2 text-black/50 text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" /> Live Preview
          </p>
        </motion.div>
      </div>
    </div>
  )
}