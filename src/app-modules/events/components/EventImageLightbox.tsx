import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  images: string[]
  startIndex: number
  onClose: () => void
}

export default function EventImageLightbox({ images, startIndex, onClose }: Props) {
  const [current, setCurrent] = useState(startIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  setCurrent(c => Math.max(0, c - 1))
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(images.length - 1, c + 1))
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors z-10"
      >
        <X size={20} />
      </button>

      {/* Prev */}
      {current > 0 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrent(c => c - 1) }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-10"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Next */}
      {current < images.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrent(c => c + 1) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-10"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Main image */}
      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {/* Counter */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums select-none">
        {current + 1} / {images.length}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-1 px-2"
          onClick={e => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={clsx(
                'w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all',
                i === current ? 'border-white opacity-100 scale-105' : 'border-white/30 opacity-50 hover:opacity-75',
              )}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
