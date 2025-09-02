import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Product from '@/models/product';
import { getDataFromToken } from '@/helper/getDataFromToken';

// 数据库连接
connect();

export const GET = async (req: NextRequest) => {
  let type = (req.nextUrl.searchParams.get('type') as any);
  const filter = {
    type: type || 'west', // 模糊查询
  }

  const data = await Product.findOne(filter)
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
    const res = await new Product(data).save();
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
