import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db';
import Sub  from '@/models/sub';

// 数据库连接
connect();

export const DELETE = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  await Sub.deleteOne({_id: id})
  return NextResponse.json({
    success: true,
    errorMessage: '删除成功',
  });
};
