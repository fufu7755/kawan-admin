import React from "react";
import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";

const EmailVerificationForm = () => {
  const nav = useRouter();  
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState('');

  const sendEmail = async (v: any) => {
    setEmail(v.email);
    const res = await fetch('/api/admin/signup/sendEmail', {
      method: 'POST',
      body: JSON.stringify(v),
    }).then((res) => res.json());
    if (res.success) {
      message.success('验证码已发送');
      setStep(2);
    }
  }

  const signUp = async (v: any) => {
    const res = await fetch('/api/admin/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        ...v,
      }),
    }).then((res) => res.json());
    if (res.success) {
      nav.push('/admin/login');
      message.success('注册成功');
    }
  }

  return (
    <Form
      labelCol={{ span: 3 }}
      onFinish={step === 1 ? sendEmail : signUp}
    >
      {step === 1 && (
        <>
          <Form.Item 
            name='email' 
            label='邮箱'
            rules={[
              {
                required: true,
                message: '请输入邮箱',
              },
              {
                type: 'email',
                message: '请输入正确的邮箱',
              },
            ]}
          >
            <Input placeholder='请输入邮箱' />
          </Form.Item>
          <Form.Item>
            <Button 
              block 
              type='primary'
              htmlType = 'submit'
            >
              下一步
            </Button>
          </Form.Item>
        </>
      )}
      {step === 2 && (
        <>
          <Form.Item 
            name='code' 
            label='验证码'
            rules={[
              {
                required: true,
                message: '请输入验证码',
              },
            ]}
          >
            <Input placeholder='请输入验证码' />
          </Form.Item>
          <Form.Item 
            name='password' 
            label='密码'
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
            ]}
          >
            <Input.Password placeholder='请输入密码' />
          </Form.Item>
          <Form.Item>
            <Button 
              block 
              type='primary'
              htmlType = 'submit'
            >
              注册
            </Button>
          </Form.Item>
        </>
      )}
    </Form>
  );

}

export default EmailVerificationForm;