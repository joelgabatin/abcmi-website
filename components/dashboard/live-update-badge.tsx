import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

interface LiveUpdateBadgeProps {
  isUpdating?: boolean
}

export function LiveUpdateBadge({ isUpdating = false }: LiveUpdateBadgeProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isUpdating) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isUpdating])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-in fade-in duration-300 z-50">
      <Zap className="w-4 h-4" />
      <span className="text-sm font-medium">Data updated</span>
    </div>
  )
}
