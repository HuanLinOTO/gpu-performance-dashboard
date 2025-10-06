"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { handleAdLinkClick, detectAdPlatform } from "@/lib/ad-utils"
import { useLanguage } from "@/hooks/use-language"
import { useTranslation, type Translations } from "@/lib/i18n"

interface FriendLink {
    name: string
    url: string
    descriptionKey: keyof Translations['footer']['friendLinks']['links']
}

const friendLinks: FriendLink[] = [
    {
        name: "Torch Performance Test",
        url: "https://github.com/zzc0721/torch-performance-test-data",
        descriptionKey: "torchPerformanceTest"
    },
    {
        name: "SVCFusion | AI 翻唱",
        url: "https://www.svcfusion.com",
        descriptionKey: "svcFusion"
    },
    {
        name: "优云智算 | UCloud",
        url: "https://passport.compshare.cn/register?referral_code=1ywd4VqDKknFWCEUZvOoWo",
        descriptionKey: "ucloud"
    },
    {
        name: "智算云扉 | AIGate",
        url: "https://account.aigate.cc/?channel=E4Z7B2W5C&coupon=AM8HLIZE2C",
        descriptionKey: "aigate"
    },
    // 可以添加更多友链
]

export function FriendLinks() {
    const { language } = useLanguage()
    const t = useTranslation(language)

    return (
        <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-16">
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* 友链标题 */}
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {language === "zh" ? "友情链接" : "Friend Links"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t.footer.friendLinks.subtitle}
                        </p>
                    </div>

                    {/* 友链卡片网格 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friendLinks.map((link, index) => {
                            const adPlatform = detectAdPlatform(link.name);

                            return (
                                <motion.div
                                    key={link.url}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block h-full"
                                        onClick={(e) => {
                                            if (adPlatform) {
                                                handleAdLinkClick(adPlatform, 'friend-link', link.url, e);
                                            }
                                        }}
                                    >
                                        <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors truncate">
                                                            {link.name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {t.footer.friendLinks.links[link.descriptionKey]}
                                                        </p>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </a>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* 底部信息 */}
                    <div className="text-center pt-8 border-t border-border/30">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <img src="/favicon.svg" alt="Logo" className="w-5 h-5" />
                                <span>GPU Performance Leaderboard</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span>{t.footer.copyright}</span>
                            <span className="hidden sm:inline">•</span>
                            <a
                                href="https://github.com/zzc0721/torch-performance-test-data"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                            >
                                {t.footer.viewOnGithub}
                            </a>
                            <span className="hidden sm:inline">•</span>
                            <a
                                href="http://beian.miit.gov.cn/?spm=a2c4g.11174386.n2.3.41d561dbuHrgEv"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                            >
                                {t.footer.icpLicense}
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}
