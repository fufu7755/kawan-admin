import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Sub from '@/models/sub';
import xss from 'xss';

// 数据库连接
connect();

// post请求
export const POST = async (req: NextRequest) => {
  try {

    // 获取请求体
    const data = await req.json();
    const email = xss(data.email);
    const res = await new Sub({
      email,
    }).save();
    return NextResponse.json({
      success: true,
      errorMessage: 'Success'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      errorMessage: error,
    });
  }
};
