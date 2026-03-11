import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const AnimatedCounter = ({
    end,
    duration = 2,
    prefix = '',
    suffix = '',
    className = ''
}) => {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (isInView && !hasAnimated.current) {
            hasAnimated.current = true
            let startTime
            let animationFrame

            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime
                const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4)
                setCount(Math.floor(easeOutQuart * end))

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animate)
                } else {
                    setCount(end)
                }
            }

            animationFrame = requestAnimationFrame(animate)

            return () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame)
                }
            }
        }
    }, [isInView, end, duration])

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className={className}
        >
            {prefix}{count.toLocaleString()}{suffix}
        </motion.span>
    )
}

export default AnimatedCounter
