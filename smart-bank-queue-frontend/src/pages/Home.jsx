import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ShieldUser, ArrowRight, Clock } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col min-h-[100dvh] pt-16 pb-12 px-6 page-enter relative bg-surface">
      
      {/* Header - Exaggerated Minimalism Typography */}
      <div className="text-center mt-12 mb-16 z-10 animate-slide-up">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4 text-primary-900 serif-heading leading-tight mx-auto max-w-[80vw]">
          Queue<br/>Smart
        </h1>
        <p className="text-primary-600 font-medium tracking-widest uppercase text-xs">
          Banking without the wait
        </p>
      </div>

      {/* Live Clock Widget - Minimalist */}
      <div className="mx-auto w-full max-w-[280px] z-10 mb-16 animate-fade-in" style={{animationDelay: '150ms'}}>
        <div className="luxury-card text-center relative overflow-hidden group border border-slate-100 py-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cta to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex items-center justify-center gap-2 text-primary-400 mb-2">
            <Clock size={16} className="animate-pulse-slow text-cta" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{formatDate(time)}</span>
          </div>
          <div className="text-4xl text-primary-900 tracking-wider font-semibold serif-heading">
            {formatTime(time)}
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="flex-1 flex flex-col gap-5 z-10 w-full animate-slide-up" style={{animationDelay: '300ms'}}>
        <button
          onClick={() => navigate('/customer')}
          className="luxury-card group flex items-center justify-between gap-6 hover:border-cta/20 border-2 border-transparent border-t-slate-100 text-left cursor-pointer w-full !p-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-primary-900 group-hover:scale-110 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300 shrink-0 shadow-luxury-sm">
              <User size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-1 serif-heading group-hover:text-cta transition-colors">Customer</h2>
              <p className="text-primary-500 text-sm font-medium tracking-wide">Join the queue.</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary-900 group-hover:bg-cta group-hover:text-white transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </button>

        <button
          onClick={() => navigate('/staff')}
          className="luxury-card group flex items-center justify-between gap-6 hover:border-cta/20 border-2 border-transparent border-t-slate-100 text-left cursor-pointer w-full !p-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-primary-900 group-hover:scale-110 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300 shrink-0 shadow-luxury-sm">
              <ShieldUser size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-1 serif-heading group-hover:text-cta transition-colors">Staff</h2>
              <p className="text-primary-500 text-sm font-medium tracking-wide">Manage queue.</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary-900 group-hover:bg-cta group-hover:text-white transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-auto pt-10 text-primary-400 text-[10px] font-bold tracking-[0.2em]">
        SECURE BANKING ENVIRONMENT
      </div>
    </div>
  )
}
