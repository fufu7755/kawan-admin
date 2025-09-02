import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Msg from '@/models/msg';
import { getDataFromToken } from '@/helper/getDataFromToken';
import xss from 'xss';

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


// post请求
export const POST = async (req: NextRequest) => {
  try {

    // 获取请求体
    const data = await req.json();
    const name = xss(data.name);
    const email = xss(data.email);
    // 创建文章
    const res = await new Msg({
      name,
      email,
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
};
