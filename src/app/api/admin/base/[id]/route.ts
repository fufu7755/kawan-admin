import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Base  from '@/models/base';
import xss from 'xss';
// 数据库连接
connect();

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  let data = await req.json(); // 请求体中传递的数据
  data.aboutContent = xss(data.aboutContent);
  data.conceptContent = xss(data.conceptContent);
  data.hours = xss(data.hours);
  data.locations = xss(data.locations);
  data.contact = xss(data.contact);
  const res = await Base.findOneAndUpdate({_id: id}, data);
  return NextResponse.json({
    success: true,
    errorMessage: '修改成功',
  });
};

export const DELETE = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  await Base.deleteOne({_id: id})
  return NextResponse.json({
    success: true,
    errorMessage: '删除成功',
  });
};
