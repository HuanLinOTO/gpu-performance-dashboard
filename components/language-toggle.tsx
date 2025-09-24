"use client"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  console.log("LanguageToggle rendered with language:", language)

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage} className="flex items-center gap-2 bg-transparent">
      <Languages className="h-4 w-4" />
      <span className="text-sm font-medium">{language === "en" ? "EN" : "中文"}</span>
    </Button>
  )
}
