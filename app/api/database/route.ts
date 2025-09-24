import { NextResponse } from "next/server"

import { parseMarkdownTable } from "@/lib/data-utils"

const GITHUB_RAW_URL =
    "https://raw.githubusercontent.com/zzc0721/torch-performance-test-data/refs/heads/main/database.md"

let cachedData: any = null
let cachedAt: number | null = null

export async function GET() {
    const now = Date.now()
    if (cachedData && cachedAt && now - cachedAt < 60 * 1000) {
        return NextResponse.json(cachedData)
    }
    try {
        const resp = await fetch(GITHUB_RAW_URL)
        if (!resp.ok) throw new Error("github fetch failed")
        const markdown = await resp.text()
        const data = parseMarkdownTable(markdown)
        cachedData = data
        cachedAt = now
        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch from GitHub" }, { status: 500 })
    }
}
