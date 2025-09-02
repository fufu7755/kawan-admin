import { NextRequest, NextResponse } from 'next/server';
import { 
  addAllowedDomain, 
  removeAllowedDomain, 
  getAllowedDomains 
} from '@/helper/domainValidator';

export const GET = async () => {
  try {
    const domains = getAllowedDomains();
    return NextResponse.json({
      success: true,
      data: domains,
      message: '获取域名白名单成功'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `获取白名单失败: ${error}`
    }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { domain } = await req.json();
    
    if (!domain) {
      return NextResponse.json({
        success: false,
        error: '缺少域名参数'
      }, { status: 400 });
    }
    
    // 验证域名格式
    try {
      new URL(`https://${domain}`);
    } catch {
      return NextResponse.json({
        success: false,
        error: '无效的域名格式'
      }, { status: 400 });
    }
    
    addAllowedDomain(domain);
    
    return NextResponse.json({
      success: true,
      message: `域名 ${domain} 已添加到白名单`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `添加域名失败: ${error}`
    }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const { domain } = await req.json();
    
    if (!domain) {
      return NextResponse.json({
        success: false,
        error: '缺少域名参数'
      }, { status: 400 });
    }
    
    removeAllowedDomain(domain);
    
    return NextResponse.json({
      success: true,
      message: `域名 ${domain} 已从白名单移除`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `移除域名失败: ${error}`
    }, { status: 500 });
  }
};
