import { NextRequest, NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import { validateUrl } from '@/helper/domainValidator';

export const GET = async (req: NextRequest) => {
  try {
    // 验证Google Trends API域名
    const googleTrendsUrl = 'https://trends.google.com';
    const validation = validateUrl(googleTrendsUrl);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: `域名验证失败: ${validation.error}` 
      }, { status: 403 });
    }

    const results = await googleTrends.dailyTrends({ geo: 'US' });

    return NextResponse.json(JSON.parse(results))
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}; 