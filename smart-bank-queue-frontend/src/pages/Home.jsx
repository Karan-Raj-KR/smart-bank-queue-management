import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ShieldUser, ArrowRight, Clock, ChevronDown, Loader2 } from 'lucide-react'
import { getBranches } from '../api'

export default function Home() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState(null)
  const [branchesLoading, setBranchesLoading] = useState(true)

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch branches on mount; auto-select if only one
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches()
        setBranches(data)
        if (data.length === 1) {
          setSelectedBranchId(data[0].id)
        }
      } catch (e) {
        console.error('Failed to load branches', e)
      } finally {
        setBranchesLoading(false)
      }
    }
    fetchBranches()
  }, [])

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const canNavigate = selectedBranchId !== null

  const goTo = (path) => {
    if (!canNavigate) return
    navigate(path, { state: { branchId: selectedBranchId } })
  }

  return (
    <div className="flex flex-col min-h-[100dvh] pt-16 pb-12 px-6 page-enter relative bg-surface">

      {/* Header */}
      <div className="text-center mt-12 mb-16 z-10 animate-slide-up">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4 text-primary-900 serif-heading leading-tight mx-auto max-w-[80vw]">
          Queue<br/>Smart
        </h1>
        <p className="text-primary-600 font-medium tracking-widest uppercase text-xs">
          Banking without the wait
        </p>
      </div>

      {/* Live Clock Widget */}
      <div className="mx-auto w-full max-w-[280px] z-10 mb-10 animate-fade-in" style={{ animationDelay: '150ms' }}>
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

      {/* Branch Selector — shown only when multiple branches exist */}
      {!branchesLoading && branches.length > 1 && (
        <div className="mx-auto w-full max-w-[320px] z-10 mb-8 animate-fade-in" style={{ animationDelay: '220ms' }}>
          <label className="block text-xs font-bold uppercase tracking-[0.1em] text-primary-900 mb-2 text-center">
            Select Branch
          </label>
          <div className="relative">
            <select
              value={selectedBranchId ?? ''}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="w-full appearance-none bg-white border-2 border-primary-900 px-5 py-3.5 pr-10 rounded-xl text-sm font-bold text-primary-900 shadow-luxury-sm cursor-pointer text-center"
            >
              <option value="" disabled>— Choose a branch —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.address ? ` · ${b.address}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-900 pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* Loading skeleton for branch fetch */}
      {branchesLoading && (
        <div className="mx-auto mb-8 flex items-center justify-center gap-2 text-primary-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Loading branches…</span>
        </div>
      )}

      {/* Navigation Cards */}
      <div className="flex-1 flex flex-col gap-5 z-10 w-full animate-slide-up" style={{ animationDelay: '300ms' }}>
        <button
          onClick={() => goTo('/customer')}
          disabled={!canNavigate}
          className={`luxury-card group flex items-center justify-between gap-6 border-2 border-transparent border-t-slate-100 text-left w-full !p-8 transition-all duration-200
            ${canNavigate
              ? 'hover:border-cta/20 cursor-pointer'
              : 'opacity-40 cursor-not-allowed'}`}
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
          onClick={() => goTo('/staff')}
          disabled={!canNavigate}
          className={`luxury-card group flex items-center justify-between gap-6 border-2 border-transparent border-t-slate-100 text-left w-full !p-8 transition-all duration-200
            ${canNavigate
              ? 'hover:border-cta/20 cursor-pointer'
              : 'opacity-40 cursor-not-allowed'}`}
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
