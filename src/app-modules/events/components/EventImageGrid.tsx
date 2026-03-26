import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadToS3 } from '@/shared/utils/s3Upload'

interface Props {
  images: string[]
  onChange: (v: string[]) => void
  deptId: string
}

export default function EventImageGrid({ images, onChange, deptId }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    if (files.length === 0) return
    e.target.value = ''
    setUploading(true)
    try {
      const urls = await Promise.all(
        files.map(file => uploadToS3(file, 'events', deptId))
      )
      onChange([...images, ...urls])
    } catch {
      // silently ignore — caller can add toast if needed
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="label mb-1.5 block">
        Images{' '}
        <span className="text-xs font-normal text-slate-400">(up to 5 per selection)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0"
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== idx))}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {uploading && (
          <div className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
            <Loader2 size={18} className="text-brand-500 animate-spin" />
          </div>
        )}

        {!uploading && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors shrink-0"
          >
            <Upload size={16} />
            <span className="text-xs">Add</span>
          </button>
        )}

        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>
    </div>
  )
}
