/**
 * 域名验证使用示例
 * 展示如何在现有代码中集成域名验证功能
 */

import { validateUrl, fetchWithDomainValidation } from '@/helper/domainValidator';

// 示例1: 简单的URL验证
export async function validateRemoteUrl(url: string) {
  const validation = validateUrl(url);
  
  if (!validation.isValid) {
    console.error('URL验证失败:', validation.error);
    return null;
  }
  
  console.log('URL验证通过');
  return true;
}

// 示例2: 安全的远程数据获取
export async function getRemoteDataSafely(url: string) {
  try {
    const data = await fetchWithDomainValidation(url);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: '请求失败'
    };
  }
}

// 示例3: 在现有API中集成域名验证
export async function exampleApiWithValidation(req: Request) {
  const { url } = await req.json();
  
  // 验证URL
  const validation = validateUrl(url);
  if (!validation.isValid) {
    return new Response(JSON.stringify({
      success: false,
      error: `域名验证失败: ${validation.error}`
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 获取远程数据
  try {
    const data = await fetchWithDomainValidation(url);
    return new Response(JSON.stringify({
      success: true,
      data: data
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: `请求失败`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 示例4: 批量验证多个URL
export async function validateMultipleUrls(urls: string[]) {
  const results = [];
  
  for (const url of urls) {
    const validation = validateUrl(url);
    results.push({
      url,
      isValid: validation.isValid,
      error: validation.error
    });
  }
  
  return results;
}

// 示例5: 自定义验证规则
export function validateUrlWithCustomRules(url: string, allowedDomains: string[]) {
  try {
    const urlObj = new URL(url);
    
    // 检查是否在自定义白名单中
    if (!allowedDomains.includes(urlObj.hostname)) {
      return {
        isValid: false,
        error: `域名 ${urlObj.hostname} 不在允许列表中`
      };
    }
    
    // 只允许HTTPS
    if (urlObj.protocol !== 'https:') {
      return {
        isValid: false,
        error: '只允许HTTPS协议'
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
