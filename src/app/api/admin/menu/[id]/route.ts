import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Menu  from '@/models/menu';

// 数据库连接
connect();

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  
  const data = await req.json(); // 请求体中传递的数据
  let menu = await Menu.findOne({_id: id});
  menu = Object.assign(menu, data);
  const res = await menu.save();
  return NextResponse.json({
    success: true,
    errorMessage: '修改成功',
  });
};

export const DELETE = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  await Menu.deleteOne({_id: id})
  return NextResponse.json({
    success: true,
    errorMessage: '删除成功',
  });
};
