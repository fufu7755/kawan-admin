import { NextRequest } from 'next/server';

// 内存存储，生产环境建议使用Redis
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// 验证规则接口
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 频率限制配置
export interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求次数
  keyGenerator?: (req: NextRequest) => string; // 自定义键生成器
}

// 数据验证函数
export function validateData(data: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} 是必填字段`);
      continue;
    }

    // 如果字段不是必填且为空，跳过其他验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // 类型验证
    if (rule.type) {
      const typeError = validateType(value, rule.type, rule.field);
      if (typeError) {
        errors.push(typeError);
        continue;
      }
    }

    // 长度验证
    if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
      errors.push(`${rule.field} 长度不能少于 ${rule.minLength} 个字符`);
    }

    if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
      errors.push(`${rule.field} 长度不能超过 ${rule.maxLength} 个字符`);
    }

    // 数值范围验证
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      errors.push(`${rule.field} 不能小于 ${rule.min}`);
    }

    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      errors.push(`${rule.field} 不能大于 ${rule.max}`);
    }

    // 正则表达式验证
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(`${rule.field} 格式不正确`);
    }

    // 自定义验证
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        errors.push(customResult);
      } else if (!customResult) {
        errors.push(`${rule.field} 验证失败`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 类型验证函数
function validateType(value: any, type: string, fieldName: string): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${fieldName} 必须是字符串类型`;
      }
      break;
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return `${fieldName} 必须是数字类型`;
      }
      break;
    case 'email':
      if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `${fieldName} 必须是有效的邮箱地址`;
      }
      break;
    case 'url':
      if (typeof value !== 'string' || !/^https?:\/\/.+/.test(value)) {
        return `${fieldName} 必须是有效的URL地址`;
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        return `${fieldName} 必须是数组类型`;
      }
      break;
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return `${fieldName} 必须是对象类型`;
      }
      break;
  }
  return null;
}

// 频率限制函数
export function checkRateLimit(req: NextRequest, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
  const key = config.keyGenerator ? config.keyGenerator(req) : getDefaultKey(req);
  const now = Date.now();
  
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    // 重置计数器
    requestCounts.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }
  
  // 增加计数
  record.count++;
  requestCounts.set(key, record);
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime
  };
}

// 默认键生成器
function getDefaultKey(req: NextRequest): string {
  const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const path = req.nextUrl.pathname;
  
  return `${ip}:${userAgent}:${path}`;
}

// 清理过期的记录（可选，用于内存管理）
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// 预设的验证规则
export const commonValidationRules = {
  // 用户注册验证
  userSignup: [
    { field: 'phone', required: true, type: 'string', pattern: /^1[3-9]\d{9}$/ },
    { field: 'email', required: false, type: 'email' },
    { field: 'password', required: true, type: 'string', minLength: 6, maxLength: 20 }
  ],
  
  // 文章创建验证
  articleCreate: [
    { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 200 },
    { field: 'content', required: true, type: 'string', minLength: 10 },
    { field: 'category', required: false, type: 'string' },
    { field: 'tags', required: false, type: 'array' }
  ],
  
  // 产品创建验证
  productCreate: [
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
    { field: 'price', required: true, type: 'number', min: 0 },
    { field: 'description', required: false, type: 'string', maxLength: 1000 },
    { field: 'category', required: true, type: 'string' }
  ],
  
  // 联系表单验证
  contactForm: [
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'email', required: true, type: 'email' },
    { field: 'message', required: true, type: 'string', minLength: 10, maxLength: 1000 }
  ],
  
  // 订阅验证
  subscription: [
    { field: 'email', required: true, type: 'email' }
  ]
};

// 预设的频率限制配置
export const rateLimitConfigs = {
  // 严格限制（防止恶意攻击）
  strict: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 5
  },
  
  // 正常限制
  normal: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 30
  },
  
  // 宽松限制
  relaxed: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100
  },
  
  // 注册限制（防止批量注册）
  signup: {
    windowMs: 5 * 60 * 1000, // 5分钟
    maxRequests: 3
  },
  
  // 登录限制（防止暴力破解）
  login: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5
  }
};
