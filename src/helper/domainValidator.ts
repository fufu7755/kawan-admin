/**
 * 域名验证工具函数
 * 用于验证远程API调用的域名安全性
 */

// 允许的域名白名单
const ALLOWED_DOMAINS = [
  'api.keywordseverywhere.com',
  'trends.google.com',
  'googleapis.com',
  'api.github.com',
  'jsonplaceholder.typicode.com',
  'httpbin.org',
  'reqres.in'
];

// 允许的协议
const ALLOWED_PROTOCOLS = ['https:', 'http:'];

/**
 * 验证URL是否安全
 * @param url 要验证的URL
 * @returns 验证结果对象
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);
    
    // 检查协议
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: `不支持的协议: ${urlObj.protocol}`
      };
    }
    
    // 检查域名是否在白名单中
    if (!ALLOWED_DOMAINS.includes(urlObj.hostname)) {
      return {
        isValid: false,
        error: `域名不在白名单中: ${urlObj.hostname}`
      };
    }
    
    // 检查是否为本地地址
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return {
        isValid: false,
        error: '不允许访问本地地址'
      };
    }
    
    // 检查是否为私有IP地址
    const ipRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
    if (ipRegex.test(urlObj.hostname)) {
      return {
        isValid: false,
        error: '不允许访问私有IP地址'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `无效的URL格式: ${error}`
    };
  }
}

/**
 * 验证并获取远程数据
 * @param url 远程API URL
 * @param options 请求选项
 * @returns Promise<any>
 */
export async function fetchWithDomainValidation(
  url: string, 
  options: RequestInit = {}
): Promise<any> {
  const validation = validateUrl(url);
  
  if (!validation.isValid) {
    throw new Error(`域名验证失败: ${validation.error}`);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`请求失败: ${error}`);
  }
}

/**
 * 添加域名到白名单
 * @param domain 要添加的域名
 */
export function addAllowedDomain(domain: string): void {
  if (!ALLOWED_DOMAINS.includes(domain)) {
    ALLOWED_DOMAINS.push(domain);
  }
}

/**
 * 移除域名从白名单
 * @param domain 要移除的域名
 */
export function removeAllowedDomain(domain: string): void {
  const index = ALLOWED_DOMAINS.indexOf(domain);
  if (index > -1) {
    ALLOWED_DOMAINS.splice(index, 1);
  }
}

/**
 * 获取当前白名单
 * @returns 白名单域名数组
 */
export function getAllowedDomains(): string[] {
  return [...ALLOWED_DOMAINS];
}
