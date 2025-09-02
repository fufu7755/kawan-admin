# POST接口数据验证和防轰炸系统

## 概述

这是一个为Next.js应用设计的完整数据验证和频率限制系统，用于防止数据轰炸和恶意攻击。

## 核心文件

### 1. `src/helper/validation.ts`
核心验证和频率限制功能：
- 数据验证函数
- 频率限制函数
- 预设验证规则
- 预设频率限制配置

### 2. `src/helper/apiValidator.ts`
API验证装饰器：
- 验证装饰器函数
- 预设验证器
- 类型定义

### 3. `src/middleware.ts`
中间件集成：
- 全局频率限制
- 路径特定限制
- 响应头设置

## 快速开始

### 1. 基本使用

```typescript
import { withValidation, validators } from '@/helper/apiValidator';

export const POST = withValidation(validators.contactForm)(async (req: NextRequest, data: any) => {
  // 数据已经通过验证，可以直接使用
  const { name, email, message } = data;
  
  // 你的业务逻辑
  return NextResponse.json({ success: true });
});
```

### 2. 自定义验证器

```typescript
const customValidator = {
  rules: [
    { field: 'title', required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
    { field: 'content', required: true, type: 'string' as const, minLength: 10 }
  ],
  rateLimit: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 10
  }
};

export const POST = withValidation(customValidator)(async (req: NextRequest, data: any) => {
  // 你的业务逻辑
});
```

## 预设验证器

| 验证器 | 用途 | 频率限制 |
|--------|------|----------|
| `userSignup` | 用户注册 | 5分钟内3次 |
| `login` | 用户登录 | 15分钟内5次 |
| `contactForm` | 联系表单 | 1分钟内5次 |
| `subscription` | 邮件订阅 | 1分钟内3次 |
| `articleCreate` | 文章创建 | 1分钟内10次 |
| `productCreate` | 产品创建 | 1分钟内10次 |

## 验证规则

### 支持的验证类型

- **类型验证**: `string`, `number`, `email`, `url`, `array`, `object`
- **长度验证**: `minLength`, `maxLength`
- **范围验证**: `min`, `max`
- **格式验证**: `pattern` (正则表达式)
- **必填验证**: `required`
- **自定义验证**: `custom` (自定义函数)

### 示例

```typescript
const rules = [
  { field: 'name', required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
  { field: 'email', required: true, type: 'email' as const },
  { field: 'age', required: false, type: 'number' as const, min: 0, max: 120 },
  { field: 'phone', required: true, type: 'string' as const, pattern: /^1[3-9]\d{9}$/ }
];
```

## 频率限制

### 配置选项

```typescript
interface RateLimitConfig {
  windowMs: number;        // 时间窗口（毫秒）
  maxRequests: number;     // 最大请求次数
  keyGenerator?: (req: NextRequest) => string; // 自定义键生成器
}
```

### 默认键生成策略

系统默认使用以下组合作为限制键：
- IP地址
- User-Agent
- API路径

### 自定义键生成器

```typescript
const customKeyGenerator = (req: NextRequest) => {
  const userId = getUserIdFromToken(req);
  return `user:${userId}:${req.nextUrl.pathname}`;
};

const validator = {
  rateLimit: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyGenerator: customKeyGenerator
  }
};
```

## 错误处理

### 验证失败响应

```json
{
  "success": false,
  "errorMessage": "数据验证失败",
  "errors": [
    "name 是必填字段",
    "email 必须是有效的邮箱地址"
  ]
}
```

### 频率限制响应

```json
{
  "success": false,
  "errorMessage": "请求过于频繁，请稍后再试",
  "resetTime": 1640995200000
}
```

## 中间件集成

系统在中间件中自动应用频率限制：

- **注册接口**: 5分钟内最多3次
- **登录接口**: 15分钟内最多5次
- **联系表单**: 1分钟内最多5次
- **订阅接口**: 1分钟内最多3次
- **其他API**: 1分钟内最多30次

## 安全特性

### 1. 输入验证
- 类型检查
- 长度限制
- 格式验证
- XSS防护

### 2. 频率限制
- IP限制
- 用户限制
- 路径限制
- 时间窗口

### 3. 错误处理
- 统一错误格式
- 不暴露敏感信息
- 详细验证错误

## 生产环境建议

### 1. 使用Redis
```typescript
// 替换内存存储为Redis
import Redis from 'ioredis';
const redis = new Redis();

// 在validation.ts中替换requestCounts的使用
```

### 2. 监控和日志
```typescript
// 添加日志记录
console.log(`Rate limit exceeded: ${key} at ${new Date().toISOString()}`);

// 添加监控指标
// 可以使用Prometheus或其他监控工具
```

### 3. 告警机制
```typescript
// 当频率限制被触发时发送告警
if (!rateLimitResult.allowed) {
  sendAlert(`Rate limit exceeded for ${key}`);
}
```

## 测试

运行测试：
```bash
npm test src/helper/__tests__/validation.test.ts
```

## 更新现有接口

### 原始代码
```typescript
export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();
    const name = xss(data.name);
    const email = xss(data.email);
    const res = await new Msg({ name, email }).save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, errorMessage: error });
  }
};
```

### 更新后的代码
```typescript
export const POST = withValidation(validators.contactForm)(async (req: NextRequest, data: any) => {
  try {
    // 数据已经通过验证，可以直接使用
    const name = xss(data.name);
    const email = xss(data.email);
    const message = xss(data.message);
    
    const res = await new Msg({ name, email, message }).save();
    return NextResponse.json({ success: true, errorMessage: 'Success' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, errorMessage: error });
  }
});
```

## 总结

这个验证系统提供了：

1. **强大的防护能力**: 防止数据轰炸和恶意攻击
2. **灵活的配置**: 支持自定义验证规则和频率限制
3. **简单的使用**: 通过装饰器模式简化API开发
4. **完整的文档**: 详细的使用指南和示例
5. **生产就绪**: 支持Redis、监控、告警等生产环境需求

通过使用这个系统，你可以大大提高应用的安全性和稳定性。
