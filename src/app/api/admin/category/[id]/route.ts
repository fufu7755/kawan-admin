import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Category  from '@/models/category';

// 数据库连接
connect();

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  let data = await req.json(); // 请求体中传递的数据
  let category = await Category.findOne({_id: id});
  if (!category) {
    return NextResponse.json({
      success: false,
      errorMessage: '数据不存在',
    });
  }
  category.title = data.title;
  category = await category.save();
  return NextResponse.json({
    success: true,
    errorMessage: '修改成功',
  });
};

export const DELETE = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  await Category.deleteOne({_id: id})
  return NextResponse.json({
    success: true,
    errorMessage: '删除成功',
  });
};
