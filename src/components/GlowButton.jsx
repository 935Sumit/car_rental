import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './GlowButton.css'

const GlowButton = ({
    children,
    to,
    onClick,
    variant = 'primary',
    size = 'medium',
    icon,
    className = '',
    ...props
}) => {
    const buttonContent = (
        <motion.span
            className={`glow-button ${variant} ${size} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            <span className="glow-effect" />
            <span className="button-content">
                {icon && <span className="button-icon">{icon}</span>}
                {children}
            </span>
            <span className="button-shine" />
        </motion.span>
    )

    if (to) {
        return <Link to={to}>{buttonContent}</Link>
    }

    return (
        <button onClick={onClick} className="glow-button-wrapper">
            {buttonContent}
        </button>
    )
}

export default GlowButton
