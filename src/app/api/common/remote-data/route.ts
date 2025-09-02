import { NextRequest, NextResponse } from 'next/server';
import { validateUrl, fetchWithDomainValidation } from '@/helper/domainValidator';

export const POST = async (req: NextRequest) => {
  try {
    const { url, options = {} } = await req.json();
    
    // 验证URL参数
    if (!url) {
      return NextResponse.json({
        success: false,
        error: '缺少URL参数'
      }, { status: 400 });
    }
    
    // 验证URL格式
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: `域名验证失败: ${validation.error}`
      }, { status: 403 });
    }
    
    // 获取远程数据
    const data = await fetchWithDomainValidation(url, options);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: '远程数据获取成功'
    });
    
  } catch (error) {
    console.error('远程数据获取失败:', error);
    return NextResponse.json({
      success: false,
      error: `请求失败: ${error}`
    }, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  const url = req.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({
      success: false,
      error: '缺少URL参数'
    }, { status: 400 });
  }
  
  try {
    // 验证URL
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: `域名验证失败: ${validation.error}`
      }, { status: 403 });
    }
    
    // 获取远程数据
    const data = await fetchWithDomainValidation(url);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: '远程数据获取成功'
    });
    
  } catch (error) {
    console.error('远程数据获取失败:', error);
    return NextResponse.json({
      success: false,
      error: `请求失败: ${error}`
    }, { status: 500 });
  }
};
