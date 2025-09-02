# 域名验证功能使用指南

## 概述

本项目实现了简单的域名验证功能，用于确保远程数据获取的安全性。通过域名白名单机制，可以控制允许访问的远程API域名，防止恶意请求和SSRF攻击。

## 功能特性

- ✅ 域名白名单验证
- ✅ 协议验证（HTTP/HTTPS）
- ✅ 本地地址和私有IP地址防护
- ✅ 动态白名单管理
- ✅ 安全的远程数据获取
- ✅ 友好的错误提示

## 文件结构

```
src/
├── helper/
│   ├── domainValidator.ts          # 核心验证工具
│   └── domainValidationExamples.ts # 使用示例
├── app/
│   ├── api/
│   │   ├── common/
│   │   │   └── remote-data/
│   │   │       └── route.ts        # 通用远程数据API
│   │   └── admin/
│   │       └── domain-whitelist/
│   │           └── route.ts         # 域名白名单管理API
│   └── admin/
│       └── (admin-layout)/
│           └── domain-validation/
│               └── page.tsx         # 管理界面
```

## 使用方法

### 1. 基本URL验证

```typescript
import { validateUrl } from '@/helper/domainValidator';

const url = 'https://api.github.com/users';
const validation = validateUrl(url);

if (validation.isValid) {
  console.log('URL验证通过');
} else {
  console.error('验证失败:', validation.error);
}
```

### 2. 安全的远程数据获取

```typescript
import { fetchWithDomainValidation } from '@/helper/domainValidator';

try {
  const data = await fetchWithDomainValidation('https://api.github.com/users');
  console.log('数据获取成功:', data);
} catch (error) {
  console.error('获取失败:', error.message);
}
```

### 3. 在API路由中使用

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateUrl, fetchWithDomainValidation } from '@/helper/domainValidator';

export const POST = async (req: NextRequest) => {
  const { url } = await req.json();
  
  // 验证URL
  const validation = validateUrl(url);
  if (!validation.isValid) {
    return NextResponse.json({
      success: false,
      error: `域名验证失败: ${validation.error}`
    }, { status: 403 });
  }
  
  // 获取远程数据
  try {
    const data = await fetchWithDomainValidation(url);
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `请求失败: ${error}`
    }, { status: 500 });
  }
};
```

### 4. 管理域名白名单

```typescript
// 添加域名到白名单
const res = await fetch('/api/admin/domain-whitelist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ domain: 'api.example.com' })
});

// 移除域名从白名单
const res = await fetch('/api/admin/domain-whitelist', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ domain: 'api.example.com' })
});

// 获取当前白名单
const res = await fetch('/api/admin/domain-whitelist');
const domains = await res.json();
```

## 默认白名单

系统默认包含以下常用API域名：

- `api.keywordseverywhere.com` - Keywords Everywhere API
- `trends.google.com` - Google Trends API
- `googleapis.com` - Google APIs
- `api.github.com` - GitHub API
- `jsonplaceholder.typicode.com` - JSONPlaceholder API
- `httpbin.org` - HTTPBin API
- `reqres.in` - ReqRes API

## 安全规则

1. **协议限制**: 只允许HTTP和HTTPS协议
2. **域名白名单**: 只有白名单中的域名才能通过验证
3. **本地地址防护**: 不允许访问localhost和127.0.0.1
4. **私有IP防护**: 不允许访问私有IP地址段（10.x.x.x, 172.16-31.x.x, 192.168.x.x）

## 管理界面

访问 `/admin/domain-validation` 页面可以：

- 查看当前域名白名单
- 添加新的域名到白名单
- 从白名单中移除域名
- 测试URL验证功能

## 集成到现有代码

### 在getTrends.ts中的集成示例

```typescript
import { validateUrl } from '@/helper/domainValidator';

export async function getKeywordsEverywhereData(keywords: string[]): Promise<any[]> {
  const url = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
  
  // 验证域名
  const validation = validateUrl(url);
  if (!validation.isValid) {
    throw new Error(`域名验证失败: ${validation.error}`);
  }
  
  // 继续原有的API调用逻辑...
}
```

## 错误处理

验证失败时会返回详细的错误信息：

- `不支持的协议: ftp:` - 协议不在允许列表中
- `域名不在白名单中: example.com` - 域名不在白名单中
- `不允许访问本地地址` - 尝试访问本地地址
- `不允许访问私有IP地址` - 尝试访问私有IP
- `无效的URL格式: ...` - URL格式错误

## 扩展功能

可以通过修改 `domainValidator.ts` 文件来：

1. 添加更多验证规则
2. 支持通配符域名
3. 添加端口号验证
4. 实现更复杂的路径验证
5. 添加请求频率限制

## 注意事项

1. 域名验证是安全的第一道防线，但不能替代其他安全措施
2. 定期审查和更新域名白名单
3. 在生产环境中，建议只允许HTTPS协议
4. 对于敏感操作，建议添加额外的身份验证和授权检查
