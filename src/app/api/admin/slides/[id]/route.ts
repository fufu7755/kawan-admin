import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Slide  from '@/models/slide';

// 数据库连接
connect();

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  let data = await req.json(); // 请求体中传递的数据
  let slide = await Slide.findOne({_id: id});
  if (!slide) {
    return NextResponse.json({
      success: false,
      errorMessage: '数据不存在',
    });
  }
  slide.title = data.title;
  slide.desc = data.desc;
  slide.img = data.img;
  slide = await slide.save();
  return NextResponse.json({
    success: true,
    errorMessage: '修改成功',
  });
};

export const DELETE = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  await Slide.deleteOne({_id: id})
  return NextResponse.json({
    success: true,
    errorMessage: '删除成功',
  });
};
