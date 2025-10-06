"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Language } from "@/lib/i18n"

interface LanguageContextType {
    language: Language
    toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
    children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguage] = useState<Language>("zh")

    useEffect(() => {
        // Check localStorage for saved language preference
        const saved = localStorage.getItem("gpu-leaderboard-language") as Language
        if (saved && (saved === "en" || saved === "zh")) {
            console.log("Loading saved language:", saved)
            setLanguage(saved)
        } else {
            // Auto-detect based on browser language
            const browserLang = navigator.language.toLowerCase()
            const detectedLang = browserLang.startsWith("zh") ? "zh" : "en"
            console.log("Auto-detected language:", detectedLang)
            setLanguage(detectedLang)
        }
    }, [])

    const toggleLanguage = () => {
        console.log("Current language:", language)
        const newLang = language === "en" ? "zh" : "en"
        console.log("Switching to:", newLang)
        setLanguage(newLang)
        localStorage.setItem("gpu-leaderboard-language", newLang)
        console.log("Language updated in localStorage:", localStorage.getItem("gpu-leaderboard-language"))
    }

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
