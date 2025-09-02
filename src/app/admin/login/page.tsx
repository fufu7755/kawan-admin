'use client';
import { Card, Form, Button, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function LoginPage() {
  const nav = useRouter();
  const [loading, setLoading] = useState(false); // 添加 loading 状态

  return (
    <div className="login-form pt-20">
      <Card title="Kawan Admin Dashboard" className="w-3/5 !mx-auto">
        <Form
          labelCol={{ span: 3 }}
          onFinish={async (v) => {
            setLoading(true); // 开始加载
            const res = await fetch('/api/admin/login', {
              method: 'POST',
              body: JSON.stringify(v),
            }).then((res) => res.json());

            if (res.success) {
              nav.push('/admin/dashboard');
              message.success('Login Success');
            } else {
              message.error(res.errorMessage);
            }
            setLoading(false); // 请求完成后取消加载状态
          }}
        >
          <Form.Item name="userName" label="User Name">
            <Input placeholder="Please enter the username" />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input.Password placeholder="Please enter the password" />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
