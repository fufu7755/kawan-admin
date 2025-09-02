import { validateData, ValidationRule } from '../validation';

// 测试数据验证功能
describe('数据验证测试', () => {
  test('必填字段验证', () => {
    const rules: ValidationRule[] = [
      { field: 'name', required: true, type: 'string' as const },
      { field: 'email', required: true, type: 'email' as const }
    ];
    
    const data = { name: 'John' };
    const result = validateData(data, rules);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('email 是必填字段');
  });

  test('邮箱格式验证', () => {
    const rules: ValidationRule[] = [
      { field: 'email', required: true, type: 'email' as const }
    ];
    
    const data = { email: 'invalid-email' };
    const result = validateData(data, rules);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('email 必须是有效的邮箱地址');
  });

  test('长度验证', () => {
    const rules: ValidationRule[] = [
      { field: 'password', required: true, type: 'string' as const, minLength: 6, maxLength: 20 }
    ];
    
    const data = { password: '123' };
    const result = validateData(data, rules);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('password 长度不能少于 6 个字符');
  });

  test('数值范围验证', () => {
    const rules: ValidationRule[] = [
      { field: 'age', required: true, type: 'number' as const, min: 18, max: 65 }
    ];
    
    const data = { age: 16 };
    const result = validateData(data, rules);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('age 不能小于 18');
  });

  test('正则表达式验证', () => {
    const rules: ValidationRule[] = [
      { field: 'phone', required: true, type: 'string' as const, pattern: /^1[3-9]\d{9}$/ }
    ];
    
    const data = { phone: '12345678901' };
    const result = validateData(data, rules);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('phone 格式不正确');
  });

  test('成功验证', () => {
    const rules: ValidationRule[] = [
      { field: 'name', required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
      { field: 'email', required: true, type: 'email' as const },
      { field: 'age', required: false, type: 'number' as const, min: 0, max: 120 }
    ];
    
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };
    
    const result = validateData(data, rules);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// 测试频率限制功能
describe('频率限制测试', () => {
  test('基本频率限制', () => {
    const { checkRateLimit } = require('../validation');
    const { NextRequest } = require('next/server');
    
    // 模拟请求
    const req = {
      ip: '127.0.0.1',
      headers: {
        get: (key: string) => {
          if (key === 'user-agent') return 'test-agent';
          return null;
        }
      },
      nextUrl: { pathname: '/api/test' }
    } as any;
    
    const config = {
      windowMs: 1000, // 1秒
      maxRequests: 3
    };
    
    // 第一次请求
    let result = checkRateLimit(req, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    
    // 第二次请求
    result = checkRateLimit(req, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
    
    // 第三次请求
    result = checkRateLimit(req, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
    
    // 第四次请求应该被拒绝
    result = checkRateLimit(req, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

// 测试验证器预设
describe('验证器预设测试', () => {
  test('联系表单验证器', () => {
    const { validators } = require('../apiValidator');
    
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message with more than 10 characters.'
    };
    
    const result = validateData(data, validators.contactForm.rules);
    expect(result.isValid).toBe(true);
  });

  test('订阅验证器', () => {
    const { validators } = require('../apiValidator');
    
    const data = {
      email: 'test@example.com'
    };
    
    const result = validateData(data, validators.subscription.rules);
    expect(result.isValid).toBe(true);
  });

  test('用户注册验证器', () => {
    const { validators } = require('../apiValidator');
    
    const data = {
      phone: '13800138000',
      email: 'user@example.com',
      password: 'password123'
    };
    
    const result = validateData(data, validators.userSignup.rules);
    expect(result.isValid).toBe(true);
  });
});
