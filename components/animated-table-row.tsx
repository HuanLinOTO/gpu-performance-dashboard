"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedTableRowProps {
    children: ReactNode
    index: number
    className?: string
}

export function AnimatedTableRow({ children, index, className }: AnimatedTableRowProps) {
    return (
        <motion.tr
            className={className}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                duration: 0.3,
                delay: Math.min(index * 0.02, 0.3), // 减少延迟间隔和最大延迟
                ease: "easeOut"
            }}
            layout
        >
            {children}
        </motion.tr>
    )
}
