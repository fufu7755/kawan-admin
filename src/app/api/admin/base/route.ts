import { NextRequest, NextResponse } from 'next/server';
import Base from '@/models/base';
import { getDataFromToken } from '@/helper/getDataFromToken';
import { connect } from '@/db';

connect();

export const GET = async (req: NextRequest) => {
  const data = await Base.findOne()
  return NextResponse.json({
    success: true,
    errorMessage: '',
    data: {
      data: data,
    },
  });
};

// post请求
export const POST = async (req: NextRequest) => {
  try {

    // 获取用户id
    const userId = getDataFromToken(req);

    // 如果没有用户id 返回False
    if (!userId) {
      return NextResponse.json({
        success: false,
        errorMessage: '请先登陆',
      });
    }

    // 获取请求体
    const data = await req.json();
    // 创建文章
    const res = await new Base(data).save();
    return NextResponse.json({
      success: true,
      errorMessage: '创建成功',
      data: res,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      errorMessage: error,
    });
  }
};
