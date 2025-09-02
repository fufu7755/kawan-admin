'use client';
import { useState } from 'react';
import { Layout, Menu, Button, theme, ConfigProvider } from 'antd';
// import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
const { Header, Sider, Content } = Layout;

function AntdAdmin({ children }: any) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const nav = useRouter();

  const logout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
    }).then(() => {
      nav.push('/admin/login');
    });
  }
  return (
    <>
      <Layout style={{ height: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className='demo-logo-vertical' />
          <Menu
            theme='dark'
            mode='inline'
            defaultSelectedKeys={['1']}
            onClick={({ key }) => {
              nav.push(key);
            }}
            items={[
              {
                key: '/admin/dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
              },
              {
                key: '/admin/sub',
                icon: <ReadOutlined />,
                label: 'Subscribe',
              }
              // {
              //   key: '/admin/base',
              //   icon: <UserOutlined />,
              //   label: '基础管理',
              // },
              // {
              //   key: '/admin/category',
              //   icon: <FolderOpenOutlined />,
              //   label: '分类管理',
              // },
              // {
              //   key: '/admin/menu',
              //   icon: <ReadOutlined />,
              //   label: '菜单管理',
              // },
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
              type='text'
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <Button type='primary' onClick={() => logout()}> 退出 </Button>
          </Header>
          <Content
            style={{
              margin: '12px',
              padding: '8px',
              minHeight: 280,
              background: colorBgContainer,
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default AntdAdmin;
