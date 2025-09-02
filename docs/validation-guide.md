# POST接口数据验证和防轰炸指南

## 概述

本指南介绍如何在你的Next.js应用中为POST接口添加数据验证和频率限制，防止数据轰炸和恶意攻击。

## 核心功能

### 1. 数据验证
- **类型验证**: 字符串、数字、邮箱、URL、数组、对象
- **长度验证**: 最小/最大长度限制
- **范围验证**: 数值范围限制
- **格式验证**: 正则表达式验证
- **必填验证**: 字段必填检查
- **自定义验证**: 自定义验证逻辑

### 2. 频率限制
- **IP限制**: 基于IP地址的限制
- **用户代理限制**: 基于User-Agent的限制
- **路径限制**: 基于API路径的限制
- **时间窗口**: 可配置的时间窗口
- **请求计数**: 可配置的最大请求次数

## 使用方法

### 基本用法

```typescript
import { withValidation, validators } from '@/helper/apiValidator';

// 使用预设验证器
export const POST = withValidation(validators.contactForm)(async (req: NextRequest, data: any) => {
  // 数据已经通过验证，可以直接使用
  const { name, email, message } = data;
  
  // 你的业务逻辑
  return NextResponse.json({ success: true });
});
```

### 自定义验证器

```typescript
import { withValidation } from '@/helper/apiValidator';

const customValidator = {
  rules: [
    { field: 'title', required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
    { field: 'content', required: true, type: 'string' as const, minLength: 10 },
    { field: 'category', required: false, type: 'string' as const }
  ],
  rateLimit: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 10
  },
  customValidation: (data: any, req: NextRequest) => {
    // 自定义验证逻辑
    if (data.title.includes('spam')) {
      return { isValid: false, errors: ['标题包含垃圾信息'] };
    }
    return { isValid: true, errors: [] };
  }
};

export const POST = withValidation(customValidator)(async (req: NextRequest, data: any) => {
  // 你的业务逻辑
});
```

## 预设验证器

### 1. 用户注册 (userSignup)
```typescript
{
  rules: [
    { field: 'phone', required: true, type: 'string', pattern: /^1[3-9]\d{9}$/ },
    { field: 'email', required: false, type: 'email' },
    { field: 'password', required: true, type: 'string', minLength: 6, maxLength: 20 }
  ],
  rateLimit: { windowMs: 5 * 60 * 1000, maxRequests: 3 } // 5分钟内最多3次
}
```

### 2. 文章创建 (articleCreate)
```typescript
{
  rules: [
    { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 200 },
    { field: 'content', required: true, type: 'string', minLength: 10 },
    { field: 'category', required: false, type: 'string' },
    { field: 'tags', required: false, type: 'array' }
  ],
  rateLimit: { windowMs: 60 * 1000, maxRequests: 10 } // 1分钟内最多10次
}
```

### 3. 联系表单 (contactForm)
```typescript
{
  rules: [
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'email', required: true, type: 'email' },
    { field: 'message', required: true, type: 'string', minLength: 10, maxLength: 1000 }
  ],
  rateLimit: { windowMs: 60 * 1000, maxRequests: 5 } // 1分钟内最多5次
}
```

### 4. 订阅 (subscription)
```typescript
{
  rules: [
    { field: 'email', required: true, type: 'email' }
  ],
  rateLimit: { windowMs: 60 * 1000, maxRequests: 3 } // 1分钟内最多3次
}
```

### 5. 登录 (login)
```typescript
{
  rules: [
    { field: 'phone', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' }
  ],
  rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 5 } // 15分钟内最多5次
}
```

## 验证规则详解

### 字段验证选项

```typescript
interface ValidationRule {
  field: string;           // 字段名
  required?: boolean;      // 是否必填
  type?: 'string' | 'number' | 'email' | 'url' | 'array' | 'object'; // 数据类型
  minLength?: number;      // 最小长度
  maxLength?: number;      // 最大长度
  min?: number;           // 最小值
  max?: number;           // 最大值
  pattern?: RegExp;        // 正则表达式
  custom?: (value: any) => boolean | string; // 自定义验证函数
}
```

### 频率限制配置

```typescript
interface RateLimitConfig {
  windowMs: number;        // 时间窗口（毫秒）
  maxRequests: number;     // 最大请求次数
  keyGenerator?: (req: NextRequest) => string; // 自定义键生成器
}
```

## 错误响应格式

### 验证失败
```json
{
  "success": false,
  "errorMessage": "数据验证失败",
  "errors": [
    "name 是必填字段",
    "email 必须是有效的邮箱地址",
    "message 长度不能少于 10 个字符"
  ]
}
```

### 频率限制
```json
{
  "success": false,
  "errorMessage": "请求过于频繁，请稍后再试",
  "resetTime": 1640995200000
}
```

## 中间件集成

系统已经在中间件中集成了基本的频率限制：

```typescript
// src/middleware.ts
const rateLimitResult = checkRateLimit(request, getRateLimitConfig(path));
if (!rateLimitResult.allowed) {
  return NextResponse.json({
    success: false,
    errorMessage: '请求过于频繁，请稍后再试',
    resetTime: rateLimitResult.resetTime
  }, { status: 429 });
}
```

## 最佳实践

### 1. 选择合适的验证器
- **敏感操作**: 使用严格的频率限制（如注册、登录）
- **一般操作**: 使用正常限制（如文章创建、产品创建）
- **公开接口**: 使用宽松限制（如查询接口）

### 2. 自定义验证逻辑
```typescript
customValidation: (data: any, req: NextRequest) => {
  // 检查用户权限
  if (!req.cookies.get('token')) {
    return { isValid: false, errors: ['请先登录'] };
  }
  
  // 检查业务逻辑
  if (data.price < 0) {
    return { isValid: false, errors: ['价格不能为负数'] };
  }
  
  return { isValid: true, errors: [] };
}
```

### 3. 错误处理
```typescript
export const POST = withValidation(validators.articleCreate)(async (req: NextRequest, data: any) => {
  try {
    // 业务逻辑
    const article = await new Article(data).save();
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json({
      success: false,
      errorMessage: '创建文章失败'
    }, { status: 500 });
  }
});
```

### 4. 生产环境优化
- 使用Redis替代内存存储进行频率限制
- 添加日志记录
- 监控异常请求
- 配置告警机制

## 安全建议

1. **输入清理**: 始终使用XSS清理用户输入
2. **类型检查**: 严格验证数据类型
3. **长度限制**: 防止过长的输入
4. **频率限制**: 防止暴力攻击
5. **错误信息**: 不要暴露敏感信息
6. **日志记录**: 记录异常请求
7. **监控告警**: 设置监控和告警

## 示例：更新现有接口

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

通过使用这个验证系统，你可以：

1. **防止数据轰炸**: 通过频率限制防止恶意请求
2. **确保数据质量**: 通过验证规则确保数据格式正确
3. **提高安全性**: 通过输入验证防止XSS和注入攻击
4. **简化开发**: 通过预设验证器快速实现常见验证
5. **灵活配置**: 通过自定义验证器满足特殊需求

这个系统为你的应用提供了强大的防护能力，同时保持了代码的简洁性和可维护性。
