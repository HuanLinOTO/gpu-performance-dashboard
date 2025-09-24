import React from "react"

/**
 * 解析 Markdown 链接并返回 JSX 元素
 * 支持格式: [文本](链接) 或直接的 URL
 */
export function parseMarkdownLinks(text: string): React.ReactNode {
    if (!text) return text

    // 匹配 Markdown 链接格式: [文本](链接)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    // 匹配直接的 URL
    const urlRegex = /(https?:\/\/[^\s]+)/g

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    // 首先处理 Markdown 链接
    while ((match = markdownLinkRegex.exec(text)) !== null) {
        // 添加链接前的文本
        if (match.index > lastIndex) {
            const beforeText = text.slice(lastIndex, match.index)
            // 检查这部分文本是否包含直接的 URL
            parts.push(parseDirectUrls(beforeText, parts.length))
        }

        // 添加 Markdown 链接
        const linkText = match[1]
        const linkUrl = match[2]
        parts.push(
            <a
                key={`md-link-${parts.length}`}
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
                {linkText}
            </a>
        )

        lastIndex = markdownLinkRegex.lastIndex
    }

    // 处理剩余的文本
    if (lastIndex < text.length) {
        const remainingText = text.slice(lastIndex)
        parts.push(parseDirectUrls(remainingText, parts.length))
    }

    // 如果没有找到任何 Markdown 链接，处理整个文本中的直接 URL
    if (parts.length === 0) {
        return parseDirectUrls(text, 0)
    }

    return <>{parts}</>
}

function parseDirectUrls(text: string, keyOffset: number): React.ReactNode {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = urlRegex.exec(text)) !== null) {
        // 添加 URL 前的文本
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index))
        }

        // 添加 URL 链接
        const url = match[1]
        // 提取域名作为显示文本
        const displayText = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
        parts.push(
            <a
                key={`url-link-${keyOffset}-${parts.length}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
                {displayText}
            </a>
        )

        lastIndex = urlRegex.lastIndex
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
    }

    // 如果没有找到任何 URL，返回原始文本
    if (parts.length === 0) {
        return text
    }

    return <>{parts}</>
}
