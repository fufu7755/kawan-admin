import React from "react";
import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";

const SmsVerificationForm = () => {
  const [isCounting, setIsCounting] = React.useState(false);
  const [time, setTime] = React.useState(60);
  const [form] = Form.useForm();
  const nav = useRouter();

  // 发送验证码
  const sendSms = async () => {
    setIsCounting(true);
    const interval = setInterval(() => {
      setTime((t) => {
        if (t === 1) {
          setIsCounting(false);
          clearInterval(interval);
        }
        return t - 1;
      });
    }, 1000);
    const { phone } = form.getFieldsValue();
    if (!phone) {
      message.error('请输入手机号');
      return;
    }
    const res = await fetch('/api/admin/signup/sendSms', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }).then((res) => res.json());
    if (res.success) {
      message.success('验证码已发送');
    } else {  
      message.error(res.errorMessage || '验证码发送失败');
    }
  }

  // 注册
  const handleSignUp = async (v: any) => {
    const res = await fetch('/api/admin/signup/smsSignup', {
      method: 'POST',
      body: JSON.stringify(v),
    }).then((res) => res.json());
    if (res.success) {
      nav.push('/admin/login');
      message.success('注册成功');
    } else {
      message.error('注册失败');
    }
  }
  return (
    <Form
      form={form}
      labelCol={{ span: 3 }}
      onFinish={handleSignUp}
    >
      <Form.Item 
        name='phone' 
        label='手机号'
        rules={[
          {
            required: true,
            message: '请输入手机号',
          },
          {
            pattern: /^1[3456789]\d{9}$/,
            message: '请输入正确的手机号',
          },
        ]}
      >
        <Input placeholder='请输入手机号' />
      </Form.Item>
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
        <Input 
          suffix={
            isCounting ? (
              <span>{time}秒后重新发送</span>
            ) : (
              <Button 
                type='link' 
                onClick={sendSms}
              >
                发送验证码
              </Button>
            )
          }
          placeholder='请输入验证码' 
        />
      </Form.Item>
      <Form.Item
        name='password'
        label='密码'
        rules={[
          {
            required: true,
            message: '请输入密码',
          },
          {
            min: 6,
            message: '密码最少6位',
          },
        ]}
      >
        <Input.Password placeholder='请输入密码' />
      </Form.Item>
      <Form.Item>
        <Button 
          block
          type='primary' 
          htmlType='submit'
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  );
}

export default SmsVerificationForm;