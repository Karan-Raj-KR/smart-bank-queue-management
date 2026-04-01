import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { checkHealth } from './api'
import Home from './pages/Home'
import Customer from './pages/Customer'
import Staff from './pages/Staff'

function ConnectionIndicator({ connected }) {
  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-luxury-md bg-white border ${
          connected ? 'border-primary-200 text-primary-900' : 'border-red-200 text-red-600'
        }`}
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? 'bg-primary-900 animate-pulse-slow' : 'bg-red-500'}`} />
        {connected ? 'LIVE' : 'OFFLINE'}
      </div>
    </div>
  )
}

function App() {
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    const check = async () => {
      const ok = await checkHealth()
      setConnected(ok)
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app-container">
      <ConnectionIndicator connected={connected} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/staff" element={<Staff />} />
      </Routes>
    </div>
  )
}

export default App
