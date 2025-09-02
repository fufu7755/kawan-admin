import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Msg from '@/models/msg';
import { getDataFromToken } from '@/helper/getDataFromToken';
import xss from 'xss';
import { withValidation, validators } from '@/helper/apiValidator';

// 数据库连接
connect();

export const GET = async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams.get('per'));
  let per = (req.nextUrl.searchParams.get('per') as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get('page') as any) * 1 || 1;

  const filter = {
  }

  const data = await Msg.find(filter).limit(per).skip((page - 1) * per);
  const total = await Msg.countDocuments(filter);
  return NextResponse.json({
    success: true,
    errorMessage: '',
    data: {
      list: data,
      pages: Math.ceil(total / per),
      total,
    },
  });
};

// 使用验证装饰器的POST请求
export const POST = withValidation(validators.contactForm)(async (req: NextRequest, data: any) => {
  try {
    // 数据已经通过验证，可以直接使用
    const name = xss(data.name);
    const email = xss(data.email);
    const message = xss(data.message || '');
    
    // 创建消息
    const res = await new Msg({
      name,
      email,
      message,
    }).save();
    
    return NextResponse.json({
      success: true,
      errorMessage: 'Success'
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      errorMessage: error,
    });
  }
});
