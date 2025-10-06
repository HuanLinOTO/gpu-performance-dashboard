"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Zap, BarChart3, Cpu } from "lucide-react"

interface PageEntranceProps {
    children: React.ReactNode
    isDataLoaded: boolean
}

export function PageEntrance({ children, isDataLoaded }: PageEntranceProps) {
    const [showContent, setShowContent] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [minAnimationComplete, setMinAnimationComplete] = useState(false)

    useEffect(() => {
        const timer1 = setTimeout(() => setCurrentStep(1), 300)
        const timer2 = setTimeout(() => setCurrentStep(2), 600)
        const timer3 = setTimeout(() => setCurrentStep(3), 900)
        // 设置最小动画时间为 1.5 秒
        const timer4 = setTimeout(() => {
            setMinAnimationComplete(true)
        }, 1500)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
            clearTimeout(timer4)
        }
    }, [])

    // 只有当数据加载完成且最小动画时间已过，才显示内容
    useEffect(() => {
        if (isDataLoaded && minAnimationComplete) {
            // 添加一个小延迟，使过渡更平滑
            const timer = setTimeout(() => {
                setShowContent(true)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isDataLoaded, minAnimationComplete])

    if (showContent) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {children}
            </motion.div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-8">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        duration: 0.8
                    }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <Cpu className="w-10 h-10 text-white" />
                        </div>
                        {/* Pulse effect */}
                        <motion.div
                            initial={{ scale: 1, opacity: 0.7 }}
                            animate={{ scale: 1.2, opacity: 0 }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl"
                        />
                    </div>
                </motion.div>

                {/* Title Animation */}
                <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={currentStep >= 1 ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >
                    GPU Performance Leaderboard
                </motion.h1>

                {/* Subtitle Animation */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={currentStep >= 2 ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="text-muted-foreground text-lg"
                >
                    Comprehensive benchmarking data from the community
                </motion.p>

                {/* Features Icons Animation */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={currentStep >= 3 ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="flex justify-center space-x-8"
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex flex-col items-center space-y-2"
                    >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xs text-muted-foreground">Analytics</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex flex-col items-center space-y-2"
                    >
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-xs text-muted-foreground">Performance</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex flex-col items-center space-y-2"
                    >
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Cpu className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-xs text-muted-foreground">Benchmarks</span>
                    </motion.div>
                </motion.div>

                {/* Loading Animation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.3 }}
                    className="flex flex-col items-center space-y-4"
                >
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 0.6,
                                    delay: i * 0.1,
                                }}
                                className="w-2 h-2 bg-blue-500 rounded-full"
                            />
                        ))}
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.3 }}
                        className="text-sm text-muted-foreground"
                    >
                        {isDataLoaded ? "Ready!" : "Loading data..."}
                    </motion.p>
                </motion.div>
            </div>
        </div>
    )
}
