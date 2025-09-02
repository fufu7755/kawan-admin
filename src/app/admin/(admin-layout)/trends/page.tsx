'use client';
import { useState } from 'react';
import { Button, List, Spin, message } from 'antd';
import PageContainer from '../../_components/PageContainer';

export default function TrendsPage() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/articles/keywords');
      const data = await res.json();
      console.log(data);
      if (data.success) {
        setKeywords(data.keywords || []);
        message.success('获取成功');
      } else {
        message.error(data.error || '获取失败');
      }
    } catch (err) {
      message.error('请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="热门关键词">
      <Button type="primary" onClick={fetchKeywords} loading={loading} style={{ marginBottom: 16 }}>
        获取关键词
      </Button>
      {loading ? (
        <Spin />
      ) : (
        <List
          bordered
          dataSource={keywords}
          renderItem={item => <List.Item>{item}</List.Item>}
          locale={{ emptyText: '暂无数据' }}
        />
      )}
    </PageContainer>
  );
}
