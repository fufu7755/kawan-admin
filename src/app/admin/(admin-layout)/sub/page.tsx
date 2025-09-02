'use client';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Table,
  Space,
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import moment from 'moment';


type Sub = {
  _id: string;
  email: string;
  createdAt: string;
};

function SubPage() {
  const [loading, setLoading] = useState(false); // 加载状态
  const [list, setList] = useState<Sub[]>([]);

  const [query, setQuery] = useState({
    per: 10,
    page: 1,
    title: '',
  });
  const [total, setTotal] = useState(0);

  // 监听查询条件的改变
  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/admin/sub?page=${query.page}&per=${query.per}&title=${query.title}`
    )
      .then((res) => res.json())
      .then((res) => {
        setList(res.data.list);
        setTotal(res.data.total);
      })
      .finally(() => {
        setLoading(false); // 数据加载完成，取消加载状态
      });
  }, [query]);

  return (
    <Card
      title='Subscribe Management'
    >
      <Table
        style={{ marginTop: '8px' }}
        dataSource={list}
        rowKey='_id'
        loading={loading} // 使用 loading 状态
        pagination={{
          total,
          onChange(page) {
            setQuery({
              ...query,
              page,
              per: 10,
            });
          },
        }}
        columns={[
          {
            title: 'Index',
            width: 80,
            render(v, r, i) {
              return i + 1;
            },
          },
          {
            title: 'Email',
            dataIndex: 'email',
          },
          {
            title: 'Created At',
            render(v, r) {
              return (
                moment(r.createdAt).format('YYYY-MM-DD HH:mm:ss')
              );
            },
          },
          {
            title: 'Action',
            render(v, r) {
              return (
                <Space>
                  <Popconfirm
                    title='Are you sure you want to delete?'
                    onConfirm={async () => {
                      //
                      await fetch('/api/admin/sub/' + r._id, {
                        method: 'DELETE',
                      }).then((res) => res.json());
                      setQuery({ ...query, per: 10, page: 1 }); // 重制查询条件，重新获取数据
                    }}
                  >
                    <Button
                      size='small'
                      icon={<DeleteOutlined />}
                      type='primary'
                      danger
                    />
                  </Popconfirm>
                </Space>
              );
            },
          },
        ]}
      />
    </Card>
  );
}

export default SubPage;
