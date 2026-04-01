import { useState, useEffect } from 'react'
import { ArrowLeft, Megaphone, Users, Clock, Flame, CalendarX, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  getQueueStatus, callNextToken, getAnalyticsSummary, getAnalyticsHourly, getAnalyticsServiceBreakdown
} from '../api'

const COUNTERS = [1, 2, 3, 4]

export default function Staff() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('TELLER')
  
  // State: Teller
  const [counterId, setCounterId] = useState(1)
  const [queueStatus, setQueueStatus] = useState(null)
  const [calling, setCalling] = useState(false)
  
  // State: Analytics
  const [summary, setSummary] = useState(null)
  const [hourlyData, setHourlyData] = useState([])
  const [breakdownData, setBreakdownData] = useState([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Polling Teller Queue Source
  useEffect(() => {
    let interval;
    if (activeTab === 'TELLER') {
      const fetchQueue = async () => {
        try {
          const data = await getQueueStatus(1)
          setQueueStatus(data)
        } catch (e) {
          console.error("Staff: failed to get queue")
        }
      }
      fetchQueue()
      interval = setInterval(fetchQueue, 5000)
    }
    return () => clearInterval(interval)
  }, [activeTab])

  // Fetch Analytics Source
  useEffect(() => {
    if (activeTab === 'ANALYTICS') {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true)
        try {
          const [sum, hour, brk] = await Promise.all([
            getAnalyticsSummary(1),
            getAnalyticsHourly(1),
            getAnalyticsServiceBreakdown(1)
          ])
          setSummary(sum)
          setHourlyData(hour?.data || [])
          setBreakdownData(brk?.data || [])
        } catch (e) {
          console.error("Staff: failed to get analytics", e)
        } finally {
          setAnalyticsLoading(false)
        }
      }
      fetchAnalytics()
    }
  }, [activeTab])

  const handleCallNext = async () => {
    setCalling(true)
    try {
      const data = await callNextToken(counterId)
      // re-poll queue status
      const q = await getQueueStatus(1)
      setQueueStatus(q)
    } catch (e) {
      alert(e?.response?.data?.detail || "Could not call next token.")
    } finally {
      setCalling(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface relative">
      
      {/* Header NavBar */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-primary-200 sticky top-0 z-40 bg-white">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors border-2 border-primary-900 shadow-luxury-sm cursor-pointer"
        >
          <ArrowLeft size={18} className="text-primary-900" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tighter text-primary-900 leading-none serif-heading">
            Staff Portal
          </h1>
          <p className="text-[10px] uppercase font-bold text-primary-500 tracking-widest mt-1">Branch #1</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 page-enter max-w-[430px] mx-auto w-full">
        {/* Custom Minimal Tabs */}
        <div className="flex bg-slate-200 rounded-lg p-1 mb-10 relative">
          <button 
            onClick={() => setActiveTab('TELLER')} 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-colors duration-300 relative z-10 cursor-pointer ${activeTab === 'TELLER' ? 'text-primary-900' : 'text-slate-500'}`}
          >
            Teller
          </button>
          <button 
            onClick={() => setActiveTab('ANALYTICS')} 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-colors duration-300 relative z-10 cursor-pointer ${activeTab === 'ANALYTICS' ? 'text-primary-900' : 'text-slate-500'}`}
          >
            Analytics
          </button>
          {/* Tab Selector Highlight */}
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-luxury-sm transition-transform duration-300 pointer-events-none ${activeTab === 'TELLER' ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'}`} />
        </div>

        {activeTab === 'TELLER' && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-900 tracking-widest uppercase">Select Desk</span>
                <select 
                  value={counterId} 
                  onChange={(e) => setCounterId(Number(e.target.value))}
                  className="bg-white border-2 border-primary-900 px-4 py-2 rounded-lg text-sm text-primary-900 appearance-none text-center font-bold shadow-luxury-sm cursor-pointer"
                >
                  {COUNTERS.map(c => <option key={c} value={c}>Counter {c}</option>)}
                </select>
             </div>

             {/* Serving Status Card - Exaggerated Minimalism */}
             <div className="luxury-card border-none text-center relative py-12 px-6">
               <p className="text-[10px] text-primary-500 font-bold uppercase tracking-[0.2em] mb-4">Currently Serving</p>
               <h2 className="text-[6rem] leading-none serif-heading font-black text-primary-900 tracking-tighter mb-6">
                 {queueStatus?.counters?.[counterId]?.token_number || '--'}
               </h2>
               <div className={`inline-flex items-center justify-center rounded-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border-2 w-auto mx-auto ${queueStatus?.counters?.[counterId] ? 'border-primary-900 text-primary-900' : 'border-slate-300 text-slate-500'}`}>
                 {queueStatus?.counters?.[counterId] ? 'IN PROGRESS' : 'IDLE'}
               </div>
             </div>

             <button 
               onClick={handleCallNext}
               disabled={calling || !queueStatus?.waiting_queue?.length}
               className="btn-primary w-full tracking-widest uppercase text-xl py-6 rounded-2xl group cursor-pointer"
             >
               {calling ? (
                  <Loader2 size={24} className="animate-spin text-white" />
               ) : (
                  <>
                    <Megaphone size={28} className="group-hover:scale-110 transition-transform" />
                    Call Next
                  </>
               )}
             </button>

             {/* Queue List Minimalist */}
             <div className="mt-12">
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-200">
                 <h3 className="font-bold text-lg text-primary-900 tracking-tight serif-heading uppercase">Waiting Queue</h3>
                 <span className="text-[10px] uppercase font-bold text-primary-500 tracking-widest">
                   {queueStatus?.waiting_queue?.length || 0} Tickets
                 </span>
               </div>

               <div className="space-y-4">
                 {queueStatus?.waiting_queue?.map((token, index) => (
                   <div key={token.token_number} className="flex justify-between items-center p-5 bg-white rounded-xl shadow-luxury-sm border border-slate-100 hover:shadow-luxury-md transition-shadow group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded bg-surface flex items-center justify-center">
                          <span className="serif-heading font-black text-primary-500 text-2xl">
                             {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                             <p className="font-bold text-primary-900 text-2xl tracking-tighter uppercase">{token.token_number}</p>
                             {token.is_priority && (
                                <span className="bg-cta text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">VIP</span>
                             )}
                          </div>
                          <p className="text-[11px] font-bold text-primary-500 uppercase tracking-widest">{token.service_type}</p>
                        </div>
                      </div>
                   </div>
                 ))}
                 {(!queueStatus?.waiting_queue || queueStatus.waiting_queue.length === 0) && (
                   <div className="text-center py-12 px-6">
                     <p className="text-primary-400 font-bold uppercase tracking-widest text-xs">The queue is currently empty.</p>
                   </div>
                 )}
               </div>
             </div>
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="space-y-8 animate-fade-in relative">
            {analyticsLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-20 flex items-center justify-center shadow-luxury-lg rounded-xl">
                <Loader2 size={32} className="animate-spin text-primary-900" />
              </div>
            )}
            
            {/* KPI Cards Grid Minimalist */}
            <div className="grid grid-cols-2 gap-4">
              <div className="luxury-card flex flex-col items-center py-8">
                <Users size={20} strokeWidth={2.5} className="text-cta mb-4" />
                <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mb-2">Total Tokens</p>
                <p className="text-4xl font-black text-primary-900 serif-heading">{summary?.total_tokens_today || 0}</p>
              </div>
              <div className="luxury-card flex flex-col items-center py-8">
                <Clock size={20} strokeWidth={2.5} className="text-secondary mb-4" />
                <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mb-2">Avg Wait</p>
                <p className="text-4xl font-black text-primary-900 serif-heading">{summary?.average_wait_time_today || 0}<span className="text-sm text-primary-500 ml-1">m</span></p>
              </div>
              <div className="luxury-card flex flex-col items-center py-8">
                <Flame size={20} strokeWidth={2.5} className="text-cta mb-4" />
                <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mb-2">Rush Hour</p>
                <p className="text-3xl font-black text-primary-900 serif-heading">{summary?.busiest_hour_today || '--'}</p>
              </div>
              <div className="luxury-card flex flex-col items-center py-8">
                <CalendarX size={20} strokeWidth={2.5} className="text-secondary mb-4" />
                <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mb-2">No Shows</p>
                <p className="text-4xl font-black text-primary-900 serif-heading">{summary?.no_show_count_today || 0}</p>
              </div>
            </div>

            {/* Hourly Traffic Chart */}
            <div className="mt-12 bg-white rounded-xl p-8 shadow-luxury-md border border-slate-100">
              <h3 className="font-bold text-lg text-primary-900 mb-8 uppercase tracking-widest text-[11px]">Hourly Traffic</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}} 
                      contentStyle={{backgroundColor: '#0F172A', borderColor: '#0F172A', borderRadius: '4px', border: 'none', color: '#fff'}}
                      itemStyle={{color: '#fff', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="token_count" fill="#CA8A04" radius={[2, 2, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Breakdown */}
            <div className="mt-10 mb-8 pb-4">
              <h3 className="font-bold text-lg text-primary-900 mb-6 uppercase tracking-widest text-[11px] flex items-center justify-between pb-4 border-b border-primary-100">
                 Service Volume
                 <ArrowRight size={14} className="text-primary-400" />
              </h3>
              <div className="bg-white rounded-xl shadow-luxury-sm overflow-hidden border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {breakdownData?.map((row, i) => (
                      <tr key={row.service_type} className={`border-slate-100 ${i !== breakdownData.length - 1 ? 'border-b' : ''} hover:bg-slate-50 transition-colors`}>
                        <td className="py-6 px-6 font-bold text-sm text-primary-900 uppercase tracking-widest">{row.service_type}</td>
                        <td className="py-6 px-6 font-bold text-xl text-right text-cta serif-heading">{row.token_count}</td>
                      </tr>
                    ))}
                    {(!breakdownData || breakdownData.length === 0) && (
                      <tr>
                        <td colSpan={2} className="py-12 bg-surface text-center text-xs font-bold uppercase tracking-widest text-primary-400">No data available today.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
