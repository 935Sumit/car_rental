import { useEffect, useState } from 'react'
import './FloatingParticles.css'

const FloatingParticles = ({ count = 30, color = 'gold' }) => {
    const [particles, setParticles] = useState([])

    useEffect(() => {
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 10,
            opacity: Math.random() * 0.5 + 0.2
        }))
        setParticles(newParticles)
    }, [count])

    const getColor = () => {
        switch (color) {
            case 'gold':
                return 'rgba(212, 175, 55, VAR_OPACITY)'
            case 'white':
                return 'rgba(255, 255, 255, VAR_OPACITY)'
            case 'mixed':
                return Math.random() > 0.5
                    ? 'rgba(212, 175, 55, VAR_OPACITY)'
                    : 'rgba(255, 255, 255, VAR_OPACITY)'
            default:
                return 'rgba(212, 175, 55, VAR_OPACITY)'
        }
    }

    return (
        <div className="floating-particles">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: getColor().replace('VAR_OPACITY', particle.opacity),
                        animationDuration: `${particle.duration}s`,
                        animationDelay: `${particle.delay}s`,
                        boxShadow: `0 0 ${particle.size * 2}px ${getColor().replace('VAR_OPACITY', particle.opacity * 0.8)}`
                    }}
                />
            ))}

            {/* Gradient orbs for ambient effect */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
        </div>
    )
}

export default FloatingParticles
