import React from "react"
import { parseMarkdownLinks } from "@/lib/markdown-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ContributorCellProps {
    contributor: string
}

function extractGitHubInfo(text: string): { username: string; displayName: string; url: string } | null {
    // 匹配 Markdown 链接格式: [显示名称](GitHub链接)
    const markdownLinkRegex = /\[([^\]]+)\]\((https:\/\/github\.com\/([^/)]+))\)/
    const markdownMatch = text.match(markdownLinkRegex)

    if (markdownMatch) {
        const displayName = markdownMatch[1]
        const url = markdownMatch[2]
        const username = markdownMatch[3]
        return { username, displayName, url }
    }

    // 匹配直接的 GitHub 链接
    const directLinkRegex = /https:\/\/github\.com\/([^/\s]+)/
    const directMatch = text.match(directLinkRegex)

    if (directMatch) {
        const username = directMatch[1]
        const url = directMatch[0]
        return { username, displayName: username, url }
    }

    return null
}

export function ContributorCell({ contributor }: ContributorCellProps) {
    if (!contributor) {
        return <span className="text-muted-foreground">-</span>
    }

    const githubInfo = extractGitHubInfo(contributor)
    console.log(contributor);


    if (githubInfo) {
        const avatarUrl = `https://github.com/${githubInfo.username}.png?size=32`

        return (
            <div className="flex items-center gap-2 max-w-[140px]">
                <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage
                        src={avatarUrl}
                        alt={githubInfo.displayName}
                        className="object-cover"
                    />
                    <AvatarFallback className="text-xs bg-muted">
                        {githubInfo.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <a
                    href={githubInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors truncate"
                    title={githubInfo.displayName}
                >
                    {githubInfo.displayName}
                </a>
            </div>
        )
    }

    // 如果不是 GitHub 链接，使用原来的 Markdown 解析
    return (
        <div className="text-xs max-w-[120px]">
            <div className="break-words leading-relaxed">
                {parseMarkdownLinks(contributor)}
            </div>
        </div>
    )
}
