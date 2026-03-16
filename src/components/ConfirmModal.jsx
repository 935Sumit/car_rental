import { motion, AnimatePresence } from 'framer-motion'

const ConfirmModal = ({ message, subMessage, onConfirm, onCancel, confirmText = 'Yes, Confirm', cancelText = 'No, Go Back', type = 'danger' }) => {

  const colors = {
    danger: '#dc2626',
    warning: '#d97706',
    info: '#2563eb'
  }

  const icons = {
    danger: '🗑️',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px 32px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            {icons[type]}
          </div>

          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '20px',
            fontWeight: '800',
            color: '#1a1a1a'
          }}>
            {message}
          </h3>

          {subMessage && (
            <p style={{
              margin: '0 0 28px 0',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.6'
            }}>
              {subMessage}
            </p>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '28px'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                background: '#fff',
                color: '#374151',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                background: colors[type],
                color: '#fff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ConfirmModal
