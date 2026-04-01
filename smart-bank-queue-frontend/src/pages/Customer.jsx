import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Clock, MapPin, UserSquare, Phone, BellRing } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { generateToken, getQueueStatus } from '../api'

import { Banknote, Wallet, FileText, Building2 } from 'lucide-react'

const SERVICES = [
  { id: 'CASH', label: 'Cash Deposit', icon: Banknote },
  { id: 'WITHDRAWAL', label: 'Cash Withdrawal', icon: Wallet },
  { id: 'LOAN', label: 'Loan Services', icon: FileText },
  { id: 'ACCOUNT', label: 'Account Opening', icon: Building2 },
]

export default function Customer() {
  const navigate = useNavigate()
  
  // State A
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [isPriority, setIsPriority] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State B
  const [tokenInfo, setTokenInfo] = useState(null)
  
  // Real-time Queue Status
  const [queueStatus, setQueueStatus] = useState(null)

  useEffect(() => {
    let interval;
    if (tokenInfo) {
      const fetchStatus = async () => {
        try {
          const data = await getQueueStatus(1) // branchId 1
          setQueueStatus(data)
        } catch (e) {
          console.error("Failed to fetch queue status")
        }
      }
      
      fetchStatus()
      interval = setInterval(fetchStatus, 10000)
    }
    
    return () => clearInterval(interval)
  }, [tokenInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !phone || !service) {
      setError('Please fill in all mandatory fields.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const data = await generateToken(name, phone, service, isPriority, 1)
      setTokenInfo(data) // Wait for UI transition
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to generate token. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate specific wait time/position based on current token
  const getMyWaitDetails = () => {
    if (!queueStatus || !tokenInfo) return { position: `--`, waitTime: `--`, status: 'WAITING' }
    
    // Find my token in waiting list
    const myPosIndex = queueStatus.waiting_queue.findIndex(t => t.token_number === tokenInfo.token_number)
    
    // See if I'm currently calling at any counter
    const isCalledAt = Object.values(queueStatus.counters).find(t => t && t.token_number === tokenInfo.token_number)

    if (isCalledAt) {
      return { status: 'CALLED', counter: isCalledAt.counter_id }
    }

    if (myPosIndex !== -1) {
      return { 
        position: myPosIndex + 1, 
        waitTime: `${Math.max(5, (myPosIndex + 1) * 5)} mins`, 
        status: 'WAITING' 
      }
    }

    return { position: `--`, waitTime: `--`, status: 'UNKNOWN' }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface relative">
      
      {/* Header NavBar Minimalist */}
      <div className="flex items-center gap-4 px-6 py-8 bg-surface sticky top-0 z-40">
        <button 
          onClick={() => {
            if (tokenInfo) {
               setTokenInfo(null)
            } else {
               navigate(-1)
            }
          }}
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border border-slate-200 shadow-luxury-sm"
        >
          <ArrowLeft size={18} className="text-primary-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-primary-900 leading-tight serif-heading">
            {tokenInfo ? 'Your Live Ticket' : 'Join Queue'}
          </h1>
          <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mt-0.5">Branch #1 (Main)</p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-12 page-enter max-w-[430px] mx-auto w-full pt-4">
        {!tokenInfo ? (
          // STATE A: FORM (Exaggerated Minimalism)
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
            {error && (
              <div className="px-5 py-4 bg-red-50 border-l-4 border-red-500 text-red-900 text-sm font-semibold flex items-center gap-3">
                <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-6">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary-900 mb-2 block">Full Name</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400">
                    <UserSquare size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    className="w-full pl-12 pr-4 py-4 rounded-xl font-medium tracking-wide transition-colors"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary-900 mb-2 block">Mobile Number</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    className="w-full pl-12 pr-4 py-4 rounded-xl font-medium tracking-wide transition-colors"
                    placeholder="e.g. +1 234 567 89"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary-900 block">Service Required</span>
              <div className="grid grid-cols-2 gap-4">
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={`
                      relative p-5 rounded-xl text-left border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center overflow-hidden cursor-pointer
                      ${service === s.id 
                        ? 'bg-primary-50 border-primary-900 text-primary-900 shadow-luxury-md -translate-y-[2px]' 
                        : 'bg-white border-transparent text-primary-500 hover:border-slate-200 hover:shadow-luxury-sm'
                      }
                    `}
                  >
                    <s.icon size={36} strokeWidth={1.5} className={service === s.id ? 'text-primary-900' : 'text-primary-300 group-hover:text-primary-500 transition-colors'} />
                    <span className={`text-[11px] font-bold tracking-widest uppercase ${service === s.id ? 'text-primary-900' : 'text-primary-600'}`}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 luxury-card !py-5 flex items-center justify-between border-t-4 border-cta">
              <div>
                <span className="text-sm font-bold text-primary-900 block tracking-tight">Priority Check-in</span>
                <span className="text-[10px] uppercase tracking-wider text-primary-500 font-semibold mt-1 block">Senior Citizens / Differently Abled</span>
              </div>
              
              {/* Luxury Style Toggle */}
              <button 
                type="button"
                onClick={() => setIsPriority(!isPriority)}
                className={`
                  w-14 h-8 rounded-full transition-colors relative shadow-inner cursor-pointer
                  ${isPriority ? 'bg-cta' : 'bg-slate-200'}
                `}
              >
                <div className={`
                  w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-luxury-sm
                  ${isPriority ? 'left-7 pointer-events-none' : 'left-1 pointer-events-none'}
                `} />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !service || !name || !phone}
              className="btn-primary mt-8 group overflow-hidden relative text-lg tracking-wide uppercase py-5 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin text-white/70" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} className="text-white drop-shadow-md" />
                  Secure Token
                </>
              )}
            </button>
          </form>
        ) : (
          // STATE B: TICKET DISPLAY (Exaggerated Minimalism)
          (() => {
            const details = getMyWaitDetails();
            const isCalled = details.status === 'CALLED';

            return (
              <div className="flex flex-col h-full items-center animate-fade-in w-full text-center">
                <div className="mb-10 w-full animate-slide-up">
                  <div className={`
                    luxury-card !p-0 !pb-10 transition-all duration-500 overflow-hidden w-full relative
                    ${isCalled ? 'border-4 border-cta shadow-2xl scale-[1.02]' : 'border border-slate-200'}
                  `}>
                    
                    <div className="absolute top-0 w-full h-12 bg-primary-50 flex items-center justify-between px-6 border-b border-slate-100">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600">Smart Bank Queue</span>
                       <div className={`
                        px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5
                        ${isCalled ? 'bg-cta text-white animate-pulse' : 'bg-slate-200 text-primary-900'}
                      `}>
                        {isCalled ? <BellRing size={10} className="text-white" /> : <Loader2 size={10} className="animate-spin" />}
                        {isCalled ? 'PROCEED TO COUNTER' : 'IN QUEUE'}
                      </div>
                    </div>

                    <div className="mt-20 mb-6">
                      <p className="text-primary-400 font-bold tracking-[0.2em] text-xs mb-3 uppercase">Priority Ticket</p>
                      <h2 className={`text-[5rem] md:text-[6.5rem] leading-none serif-heading font-bold tracking-tighter ${isCalled ? 'text-cta' : 'text-primary-900'}`}>
                        {tokenInfo.token_number}
                      </h2>
                    </div>
                    
                    <div className="inline-flex items-center justify-center bg-transparent border-2 border-primary-900 text-primary-900 rounded-full px-5 py-2 mt-4">
                      <p className="text-[11px] font-bold tracking-widest uppercase">{tokenInfo.service_type} • {isPriority ? 'PRIORITY' : 'REGULAR'}</p>
                    </div>

                    <div className="mt-14 pt-8 bg-surface-elevated mx-[-1px] border-t border-slate-200">
                      {isCalled ? (
                        <div className="animate-slide-up pb-8">
                          <p className="text-primary-500 text-xs tracking-widest uppercase font-bold mb-4">Please proceed immediately to</p>
                          <p className="text-5xl font-black text-primary-900 serif-heading">COUNTER {details.counter}</p>
                        </div>
                      ) : (
                         <div className="grid grid-cols-2 gap-6 divide-x divide-slate-300 px-6 pb-2">
                          <div className="flex flex-col items-center gap-2">
                             <MapPin size={24} className="text-primary-400 mb-1" />
                             <span className="text-4xl font-bold text-primary-900 serif-heading">{details.position}</span>
                             <span className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mt-1">in line</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                             <Clock size={24} className="text-cta mb-1" />
                             <span className="text-4xl font-bold text-primary-900 serif-heading">{details.waitTime}</span>
                             <span className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mt-1">est. wait</span>
                          </div>
                         </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-primary-500 font-bold tracking-wide px-8 text-center leading-relaxed">
                  {isCalled 
                    ? "Your number has been called! Please present this screen." 
                    : "Wait in the seating area. We will alert you when it's your turn."}
                </p>
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}
