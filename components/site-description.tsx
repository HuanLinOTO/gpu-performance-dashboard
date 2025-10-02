"use client"

import { useLanguage } from "@/hooks/use-language"
import { useTranslation } from "@/lib/i18n"
import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SiteDescription() {
    const { language } = useLanguage()
    const t = useTranslation(language)

    return (
        <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>{t.dashboard.description.title}</AlertTitle>
            <AlertDescription>
                <ul className="mt-2 space-y-1.5 text-sm">
                    {t.dashboard.description.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <span className="mr-2 mt-0.5 text-primary">•</span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    )
}
