import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  const colors = {
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    info: '#2563eb'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -60, scale: 0.9 }}
        style={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          zIndex: 99999,
          background: '#fff',
          border: `2px solid ${colors[type]}`,
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          maxWidth: '400px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          cursor: 'pointer'
        }}
        onClick={onClose}
      >
        <span style={{ fontSize: '20px' }}>{icons[type]}</span>
        <p style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          color: '#1a1a1a',
          flex: 1
        }}>
          {message}
        </p>
        <span style={{
          fontSize: '18px',
          color: '#999',
          fontWeight: '300',
          lineHeight: 1
        }}>×</span>
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast
