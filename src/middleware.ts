import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitConfigs } from '@/helper/validation';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = path === '/admin/login' || path === '/admin/signup';
  const token = request.cookies.get('token');
  
  // 基本路径重定向
  if (path === '/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 频率限制检查
  const rateLimitResult = checkRateLimit(request, getRateLimitConfig(path));
  if (!rateLimitResult.allowed) {
    return NextResponse.json({
      success: false,
      errorMessage: '请求过于频繁，请稍后再试',
      resetTime: rateLimitResult.resetTime
    }, { status: 429 });
  }

  // 添加频率限制头信息
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  // 管理后台访问控制
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isPublic) {
      if (!request.cookies.get('token')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  return response;
}

// 根据路径获取相应的频率限制配置
function getRateLimitConfig(path: string) {
  // API路径的特殊限制
  if (path.startsWith('/api/admin/signup')) {
    return rateLimitConfigs.signup;
  }
  
  if (path.startsWith('/api/admin/login')) {
    return rateLimitConfigs.login;
  }
  
  // 联系表单和订阅等敏感接口使用严格限制
  if (path.startsWith('/api/contact') || path.startsWith('/api/sub')) {
    return rateLimitConfigs.strict;
  }
  
  // 其他API接口使用正常限制
  if (path.startsWith('/api/')) {
    return rateLimitConfigs.normal;
  }
  
  // 默认使用宽松限制
  return rateLimitConfigs.relaxed;
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
