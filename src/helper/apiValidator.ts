import { NextRequest, NextResponse } from 'next/server';
import { validateData, ValidationRule, ValidationResult, checkRateLimit, RateLimitConfig } from './validation';

// API验证装饰器类型
export type ApiValidator = {
  rules?: ValidationRule[];
  rateLimit?: RateLimitConfig;
  customValidation?: (data: any, req: NextRequest) => ValidationResult;
};

// 验证装饰器函数
export function withValidation(validator: ApiValidator = {}) {
  return function (handler: (req: NextRequest, data: any) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      try {
        // 1. 频率限制检查
        if (validator.rateLimit) {
          const rateLimitResult = checkRateLimit(req, validator.rateLimit);
          if (!rateLimitResult.allowed) {
            return NextResponse.json({
              success: false,
              errorMessage: '请求过于频繁，请稍后再试',
              resetTime: rateLimitResult.resetTime
            }, { status: 429 });
          }
        }

        // 2. 获取请求数据
        let data;
        try {
          data = await req.json();
        } catch (error) {
          return NextResponse.json({
            success: false,
            errorMessage: '无效的JSON数据'
          }, { status: 400 });
        }

        // 3. 数据验证
        if (validator.rules && validator.rules.length > 0) {
          const validationResult = validateData(data, validator.rules);
          if (!validationResult.isValid) {
            return NextResponse.json({
              success: false,
              errorMessage: '数据验证失败',
              errors: validationResult.errors
            }, { status: 400 });
          }
        }

        // 4. 自定义验证
        if (validator.customValidation) {
          const customResult = validator.customValidation(data, req);
          if (!customResult.isValid) {
            return NextResponse.json({
              success: false,
              errorMessage: '自定义验证失败',
              errors: customResult.errors
            }, { status: 400 });
          }
        }

        // 5. 调用原始处理器
        return await handler(req, data);

      } catch (error) {
        console.error('API验证错误:', error);
        return NextResponse.json({
          success: false,
          errorMessage: '服务器内部错误'
        }, { status: 500 });
      }
    };
  };
}

// 常用的验证器预设
export const validators = {
  // 用户注册验证器
  userSignup: {
    rules: [
      { field: 'phone', required: true, type: 'string' as const, pattern: /^1[3-9]\d{9}$/ },
      { field: 'email', required: false, type: 'email' as const },
      { field: 'password', required: true, type: 'string' as const, minLength: 6, maxLength: 20 }
    ],
    rateLimit: {
      windowMs: 5 * 60 * 1000, // 5分钟
      maxRequests: 3
    }
  },

  // 文章创建验证器
  articleCreate: {
    rules: [
      { field: 'title', required: true, type: 'string' as const, minLength: 1, maxLength: 200 },
      { field: 'content', required: true, type: 'string' as const, minLength: 10 },
      { field: 'category', required: false, type: 'string' as const },
      { field: 'tags', required: false, type: 'array' as const }
    ],
    rateLimit: {
      windowMs: 60 * 1000, // 1分钟
      maxRequests: 10
    }
  },

  // 产品创建验证器
  productCreate: {
    rules: [
      { field: 'name', required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
      { field: 'price', required: true, type: 'number' as const, min: 0 },
      { field: 'description', required: false, type: 'string' as const, maxLength: 1000 },
      { field: 'category', required: true, type: 'string' as const }
    ],
    rateLimit: {
      windowMs: 60 * 1000, // 1分钟
      maxRequests: 10
    }
  },

  // 联系表单验证器
  contactForm: {
    rules: [
      { field: 'name', required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
      { field: 'email', required: true, type: 'email' as const },
      { field: 'message', required: true, type: 'string' as const, minLength: 10, maxLength: 1000 }
    ],
    rateLimit: {
      windowMs: 60 * 1000, // 1分钟
      maxRequests: 5
    }
  },

  // 订阅验证器
  subscription: {
    rules: [
      { field: 'email', required: true, type: 'email' as const }
    ],
    rateLimit: {
      windowMs: 60 * 1000, // 1分钟
      maxRequests: 3
    }
  },

  // 登录验证器
  login: {
    rules: [
      { field: 'phone', required: true, type: 'string' as const },
      { field: 'password', required: true, type: 'string' as const }
    ],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 5
    }
  }
};
