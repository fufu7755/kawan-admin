import { NextRequest, NextResponse } from 'next/server';
import {connect} from '@/db';
import User from '@/models/user';

// 数据库连接
connect();

const sendSms = async (phone: string, code: string) => {
  // 发送短信
  try {
    const apiKey = process.env.SMS_KEY || '';
    const res = await fetch('https://sms.yunpian.com/v2/sms/single_send.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: apiKey,
        mobile: phone,
        text: `【金榜有我】您的验证码是${code}。如非本人操作，请忽略本短信`,
      }),
    });
    const data = await res.json();
    if (data.code !== 0) {
      // 短信发送失败
      return false;
    } else {
      // 短信发送成功
      return true;
    }
  } catch (error) {
    // 短信发送失败
    return false;
  }
}

export const POST = async (request: NextRequest) => {
  try {

    // 获取请求体
    const req = await request.json();
    const { phone } = req;

    // 查询数据库 是否存在该用户
    const user = await User.findOne({ phone });
    // 如果存在该用户
    if (user) {
      if (user.status) {
        // 用户已注册
        return NextResponse.json({
          success: false,
          errorMessage: '用户名已存在',
        }, {status: 400});
      } else {
        const res = await sendSms(user.phone, user.code)
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
      phone,
      code,
    });

    // 保存用户
    await newUser.save();

    // 发送验证码
    const res = await sendSms(phone, code);

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
