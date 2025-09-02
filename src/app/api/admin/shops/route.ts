import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Shop from '@/models/shop';
import { getDataFromToken } from '@/helper/getDataFromToken';

// 数据库连接
connect();

export const GET = async (req: NextRequest) => {
  let per = (req.nextUrl.searchParams.get('per') as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get('page') as any) * 1 || 1;
  let name = (req.nextUrl.searchParams.get('name') as string) || '';

  const filter = {
    name: new RegExp(name + '.*', 'i'), // 模糊查询
  }

  const data = await Shop.find(filter).limit(per).skip((page - 1) * per);
  const total = await Shop.countDocuments(filter);
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
    const res = await new Shop(data).save();
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
