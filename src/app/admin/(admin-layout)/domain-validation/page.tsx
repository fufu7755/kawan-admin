'use client';
import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, List, Tag, Space, Modal } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PageContainer from '../../_components/PageContainer';

interface DomainWhitelistItem {
  domain: string;
}

export default function DomainValidationPage() {
  const [loading, setLoading] = useState(false);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [newDomain, setNewDomain] = useState('');

  // 获取域名白名单
  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/domain-whitelist');
      const data = await res.json();
      if (data.success) {
        setWhitelist(data.data);
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error('获取白名单失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加域名到白名单
  const addDomain = async () => {
    if (!newDomain.trim()) {
      message.error('请输入域名');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/domain-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() })
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.message);
        setNewDomain('');
        fetchWhitelist();
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error('添加域名失败');
    } finally {
      setLoading(false);
    }
  };

  // 移除域名从白名单
  const removeDomain = async (domain: string) => {
    Modal.confirm({
      title: '确认移除',
      content: `确定要从白名单中移除域名 "${domain}" 吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/admin/domain-whitelist', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain })
          });
          const data = await res.json();
          if (data.success) {
            message.success(data.message);
            fetchWhitelist();
          } else {
            message.error(data.error);
          }
        } catch (error) {
          message.error('移除域名失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 测试URL验证
  const testUrlValidation = async () => {
    if (!testUrl.trim()) {
      message.error('请输入要测试的URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/common/remote-data?url=${encodeURIComponent(testUrl)}`);
      const data = await res.json();
      setTestResult(data);
      
      if (data.success) {
        message.success('URL验证通过，数据获取成功');
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error('测试失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取白名单
  useEffect(() => {
    fetchWhitelist();
  }, []);

  return (
    <PageContainer title="域名验证管理">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* 域名白名单管理 */}
        <Card title="域名白名单管理" extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={fetchWhitelist}>
            刷新列表
          </Button>
        }>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Input
                placeholder="输入要添加的域名，如: api.example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                style={{ width: 300 }}
                onPressEnter={addDomain}
              />
              <Button type="primary" onClick={addDomain} loading={loading}>
                添加域名
              </Button>
            </Space>
            
            <List
              loading={loading}
              dataSource={whitelist}
              renderItem={(domain) => (
                <List.Item
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeDomain(domain)}
                    >
                      移除
                    </Button>
                  ]}
                >
                  <Tag color="green">{domain}</Tag>
                </List.Item>
              )}
              locale={{ emptyText: '暂无域名' }}
            />
          </Space>
        </Card>

        {/* URL验证测试 */}
        <Card title="URL验证测试">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Input
                placeholder="输入要测试的URL，如: https://api.github.com/users"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                style={{ width: 400 }}
                onPressEnter={testUrlValidation}
              />
              <Button type="primary" onClick={testUrlValidation} loading={loading}>
                测试验证
              </Button>
            </Space>
            
            {testResult && (
              <Card size="small" title="测试结果">
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </Card>
            )}
          </Space>
        </Card>

        {/* 使用说明 */}
        <Card title="使用说明">
          <ul>
            <li>域名白名单用于控制允许访问的远程API域名</li>
            <li>只有白名单中的域名才能通过验证并获取数据</li>
            <li>默认已包含常用的API域名，如Google Trends、GitHub API等</li>
            <li>可以动态添加或移除域名</li>
            <li>支持HTTPS和HTTP协议</li>
            <li>不允许访问本地地址和私有IP地址</li>
          </ul>
        </Card>
      </Space>
    </PageContainer>
  );
}
