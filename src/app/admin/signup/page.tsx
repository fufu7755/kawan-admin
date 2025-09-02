'use client';
import { Card, Tabs } from 'antd';
import EmailVerificationForm from './_components/EmailVerificationForm';
import SmsVerificationForm from './_components/SmsVerificationForm';
const { TabPane } = Tabs;

function SignUpPage() {
  return (
    <div className='login-form pt-20'>
      <Card title='Next全栈管理后台 用户注册' className='w-4/5 !mx-auto'>
        <Tabs defaultActiveKey='1' centered>
          <TabPane tab='邮箱注册' key='1'>
            <EmailVerificationForm />
          </TabPane>
          <TabPane tab='手机注册' key='2'>
            <SmsVerificationForm />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default SignUpPage;
