import { NextRequest, NextResponse } from 'next/server';
import {connect} from '@/db';
import User from '@/models/user';
import bcryptjs from 'bcryptjs';

// 数据库连接
connect();

export const POST = async (request: NextRequest) => {
  try {

    // 获取请求体
    const req = await request.json();
    const { email, code, password } = req;

    // 查询数据库 是否存在该用户
    const user = await User.findOne({ email });

    // 如果不存在该用户
    if (!user) {
      return NextResponse.json({
        success: false,
        errorMessage: '重新注册',
      }, {status: 400});
    }

    // 验证码错误
    if (user.code !== code) {
      return NextResponse.json({
        success: false,
        errorMessage: '验证码错误',
      }, {status: 400});
    }

    // 密码加密
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);

    // 更新用户
    user.password = hash;
    user.status = true;

    // 保存用户
    const res = await user.save();

    // 返回响应
    return NextResponse.json({
      success: true,
      errorMessage: '注册成功',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      errorMessage: '注册失败',
    }, {status: 500});
  }
};
