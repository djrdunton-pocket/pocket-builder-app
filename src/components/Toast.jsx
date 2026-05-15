import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  const colors = {
    success: { bg: '#00c9a722', border: '#00c9a7', text: '#00c9a7', icon: '✓' },
    error:   { bg: '#ef444422', border: '#ef4444', text: '#ef4444', icon: '✗' },
    info:    { bg: '#3b82f622', border: '#3b82f6', text: '#3b82f6', icon: 'ℹ' },
  }

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none', width: '90%', maxWidth: 360 }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.success
          return (
            <div key={t.id} style={{ background: '#111d35', border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px #0008', animation: 'slideDown 0.2s ease', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.bg, border: `1.5px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: c.text, fontWeight: 800, flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff', flex: 1 }}>{t.message}</span>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastCtx.Provider>
  )
}