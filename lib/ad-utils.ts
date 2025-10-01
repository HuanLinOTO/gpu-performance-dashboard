/**
 * 广告事件追踪工具
 * 用于 Google Analytics 事件追踪
 */

declare global {
    interface Window {
        gtag?: (
            command: string,
            eventName: string,
            params?: Record<string, any>
        ) => void;
    }
}

export type AdPlatform = 'ucloud' | 'aigate';
export type AdSource = 'table' | 'friend-link';

/**
 * 广告平台配置
 */
const AD_PLATFORM_CONFIG = {
    ucloud: {
        name: 'UCloud',
        url: 'https://www.ucloud.cn/',
        keywords: ['ucloud', '优云智算'],
    },
    aigate: {
        name: 'AIGate',
        url: 'https://account.aigate.cc/?channel=E4Z7B2W5C&coupon=AM8HLIZE2C',
        keywords: ['aigate'],
    },
} as const;

/**
 * 追踪广告点击事件
 * @param platform 广告平台
 * @param source 点击来源 (table | friend-link)
 * @param url 目标 URL
 */
export function trackAdClick(platform: AdPlatform, source: AdSource, url: string) {
    // 发送 Google Analytics 事件
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', `click_${platform}_ad`, {
            event_category: 'advertisement',
            event_label: source,
            click_source: source,
            destination_url: url,
            platform,
        });
    }

    // 控制台日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Ad Event] ${AD_PLATFORM_CONFIG[platform].name} Ad Clicked:`, {
            platform,
            source,
            url,
            timestamp: new Date().toISOString(),
        });
    }
}

/**
 * 处理广告链接点击
 * 先追踪事件，再跳转
 * @param platform 广告平台
 * @param source 点击来源
 * @param url 目标 URL
 * @param event 点击事件（可选，用于阻止默认行为）
 */
export function handleAdLinkClick(
    platform: AdPlatform,
    source: AdSource,
    url: string,
    event?: React.MouseEvent
) {
    // 阻止默认行为
    if (event) {
        event.preventDefault();
    }

    // 追踪事件
    trackAdClick(platform, source, url);

    // 延迟跳转，确保事件发送成功
    setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, 100);
}

/**
 * 检查是否为广告平台相关内容
 * @param text 要检查的文本
 * @returns 广告平台信息，如果不是广告则返回 null
 */
export function detectAdPlatform(text: string): AdPlatform | null {
    const lowerText = text.toLowerCase();

    for (const [platform, config] of Object.entries(AD_PLATFORM_CONFIG)) {
        if (config.keywords.some(keyword => lowerText.includes(keyword))) {
            return platform as AdPlatform;
        }
    }

    return null;
}

/**
 * 获取广告平台 URL
 * @param platform 广告平台
 */
export function getAdPlatformUrl(platform: AdPlatform): string {
    return AD_PLATFORM_CONFIG[platform].url;
}
