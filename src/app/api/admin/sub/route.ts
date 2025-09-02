import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Sub from '@/models/sub';
import { getDataFromToken } from '@/helper/getDataFromToken';
import xss from 'xss';

// 数据库连接
connect();

export const GET = async (req: NextRequest) => {
  // 获取用户id
  const userId = getDataFromToken(req);

  // 如果没有用户id 返回False
  if (!userId) {
    return NextResponse.json({
      success: false,
      errorMessage: 'Please login',
    });
  }
  let per = (req.nextUrl.searchParams.get('per') as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get('page') as any) * 1 || 1;

  const filter = {
  }

  const data = await Sub.find(filter).limit(per).skip((page - 1) * per);
  const total = await Sub.countDocuments(filter);
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
