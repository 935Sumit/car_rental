import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      background: 'var(--bg-cream, #faf8f5)'
    }}>

      {/* Big 404 */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{
          fontSize: '120px',
          fontWeight: '900',
          color: 'var(--primary-color, #5c3d1e)',
          lineHeight: 1,
          opacity: 0.15,
          fontFamily: "'Cormorant Garamond', serif"
        }}>
          404
        </div>
      </motion.div>

      {/* Car emoji */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        style={{ fontSize: '80px', marginTop: '-30px' }}
      >
        🚗
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: 'var(--primary-color, #5c3d1e)',
          margin: '20px 0 10px 0',
          fontFamily: "'Cormorant Garamond', serif"
        }}
      >
        Oops! Wrong Road 🛣️
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          fontSize: '1rem',
          color: '#888',
          maxWidth: '400px',
          lineHeight: '1.7',
          margin: '0 0 36px 0'
        }}
      >
        The page you are looking for does not exist or has been moved.
        Let us take you back to the right track! 🏁
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '14px 32px',
            background: 'var(--primary-color, #5c3d1e)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          🏠 Go Back Home
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '14px 32px',
            background: 'transparent',
            color: 'var(--primary-color, #5c3d1e)',
            border: '2px solid var(--primary-color, #5c3d1e)',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.target.style.opacity = '0.7'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          ← Go Back
        </button>
      </motion.div>

    </div>
  )
}

export default NotFound
