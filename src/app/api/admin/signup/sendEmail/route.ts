import { NextRequest, NextResponse } from 'next/server';
import {connect} from '@/db';
import User from '@/models/user';
import {sendEmail} from '@/helper/sendEmail';

// 数据库连接
connect();

export const POST = async (request: NextRequest) => {
  try {

    // 获取请求体
    const req = await request.json();
    const { email } = req;

    // 查询数据库 是否存在该用户
    const user = await User.findOne({ email });

    // 如果存在该用户
    if (user) {
      if (user.status) {
        // 用户已注册
        return NextResponse.json({
          success: false,
          errorMessage: '用户名已存在',
        }, {status: 400});
      } else {
        const res = await sendEmail(user.email, user.code)
        if (res) {
          return NextResponse.json({
            success: true,
            errorMessage: '验证码已发送',
          });
        } else {
          return NextResponse.json({
            success: false,
            errorMessage: '验证码发送失败',
          }, {status: 500});
        }
      }
    }

    // 生成验证码
    const code = Math.random().toString().slice(-6);

    // 创建用户
    const newUser = new User({
      email,
      code,
    });

    // 保存用户
    await newUser.save();

    // 发送验证码
    const res = await sendEmail(email, code);

    if (!res) {
      return NextResponse.json({
        success: false,
        errorMessage: '验证码发送失败',
      }, {status: 500});
    } else {
      return NextResponse.json({
        success: true,
        errorMessage: '验证码已发送',
      });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      errorMessage: '注册失败',
    }, {status: 500});
  }
};
