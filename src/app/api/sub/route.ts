import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Sub from '@/models/sub';
import xss from 'xss';

// 数据库连接
connect();

const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// post请求
export const POST = async (req: NextRequest) => {
  try {

    // 获取请求体
    const data = await req.json();
    const email = xss(data.email);
    // 检查邮件格式是否正确
    if (!validateEmail(email)) {
      return NextResponse.json({
        success: false,
        errorMessage: 'Invalid email format',
      });
    }
    const existingSub = await Sub.findOne({ email });
    if (existingSub) {
      return NextResponse.json({
        success: true,
        errorMessage: 'Success'
      });
    }
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
