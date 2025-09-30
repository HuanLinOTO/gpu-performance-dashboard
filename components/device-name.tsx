"use client"

import { memo } from "react"

interface DeviceNameProps {
    name: string
    className?: string
}

export const DeviceName = memo(function DeviceName({ name, className = "font-mono text-sm" }: DeviceNameProps) {
    const upperName = name.toUpperCase()
    const isNvidia = upperName.includes('NVIDIA')
    const isAmd = upperName.includes('AMD')
    const isAscend = upperName.includes('ASCEND')

    if (!isNvidia && !isAmd && !isAscend) {
        return <div className={className}>{name}</div>
    }

    return (
        <div className="flex items-center gap-2">
            {isNvidia && (
                <img width="16" height="16" src="https://img.icons8.com/color/48/nvidia.png" alt="nvidia" />
            )}
            {isAmd && (
                <img width="16" height="16" src="https://img.icons8.com/ios-filled/50/amd.png" alt="amd" />
            )}
            {isAscend && (
                <img width="16" height="16" src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-huawei-technologies-company-a-chinese-multinational-technology-provides-telecommunications-equipment-and-consumer-electronics-logo-color-tal-revivo.png" alt="huawei-ascend" />
            )}
            <div className={className}>{name}</div>
        </div>
    )
})
