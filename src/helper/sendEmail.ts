import nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import {codeTpl} from './tpls/codeTpl'

export const sendEmail = async (email: string, code: string) => {
  try {
    // 创建邮件传输对象
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 编译模板
    const template = handlebars.compile(codeTpl)
    // 生成html
    const html = template({code})

    // 邮件信息
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '验证码',
      html: html,
    };

    // 发送邮件
    const res = await transporter.sendMail(mailOptions);
    console.log(res)
    return true 
  } catch (error) {
    // 发送失败
    console.log(error)
    return false
  }
}