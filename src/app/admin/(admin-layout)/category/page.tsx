'use client';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Table,
  Modal,
  Space,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import { useRouter } from 'next/navigation';

type Category = {
  _id: string;
  title: string;
};

function CategoryPage() {
  const [loading, setLoading] = useState(false); // 加载状态
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Category[]>([]);
  const [myForm] = Form.useForm(); // 获取Form组件
  const nav = useRouter();

  const [query, setQuery] = useState({
    per: 10,
    page: 1,
    title: '',
  });
  const [currentId, setCurrentId] = useState(''); // 使用一个当前id变量，表示是新增还是修改
  const [total, setTotal] = useState(0);
  // 如果存在表示修改，不存在表示新增

  // 监听查询条件的改变
  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/admin/category?page=${query.page}&per=${query.per}`
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

  useEffect(() => {
    if (!open) {
      setCurrentId('');
    }
  }, [open]);

  return (
    <Card
      title='分类管理'
      extra={
        <>
          <Button
            icon={<PlusOutlined />}
            type='primary'
            onClick={() => setOpen(true)}
          />
        </>
      }
    >
      {/* <Form
        layout='inline'
        onFinish={(v) => {
          setQuery({
            page: 1,
            per: 10,
            title: v.title,
          });
        }}
      >
        <Form.Item label='标题' name='title'>
          <Input placeholder='请输入关键词' />
        </Form.Item>
        <Form.Item>
          <Button icon={<SearchOutlined />} htmlType='submit' type='primary' />
        </Form.Item>
      </Form> */}
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
            title: '序号',
            width: 80,
            render(v, r, i) {
              return i + 1;
            },
          },
          {
            title: '名称',
            dataIndex: 'title',
          },
          {
            title: '操作',
            render(v, r) {
              return (
                <Space>
                  <Button
                    size='small'
                    icon={<EditOutlined />}
                    type='primary'
                    onClick={() => {
                      setOpen(true);
                      setCurrentId(r._id);
                      myForm.setFieldsValue(r);
                    }}
                  />
                  <Popconfirm
                    title='是否确认删除?'
                    onConfirm={async () => {
                      //
                      await fetch('/api/admin/category/' + r._id, {
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
      <Modal
        title='编辑'
        open={open}
        onCancel={() => setOpen(false)}
        destroyOnClose={true} // 关闭窗口之后销毁
        maskClosable={false} // 点击空白区域的时候不关闭
        onOk={() => {
          myForm.submit();
        }}
        width={'75vw'}
      >
        <Form
          preserve={false} // 和modal结合使用的时候需要加上它，否则不会销毁
          layout='vertical'
          form={myForm}
          onFinish={async (v) => {
            if (currentId) {
              // 修改
              await fetch('/api/admin/category/' + currentId, {
                body: JSON.stringify(v),
                method: 'PUT',
              }).then((res) => res.json());
            } else {
              await fetch('/api/admin/category', {
                method: 'POST',
                body: JSON.stringify(v),
              }).then((res) => res.json())
                .then((res) => {
                  if (!res.success) {
                    nav.push('/admin/login')
                  }
                });
            }

            // 此处需要调接口
            setOpen(false);
            setQuery({ ...query }); // 改变query会重新去取数据
          }}
        >
          <Form.Item
            label='名称'
            name='title'
            rules={[
              {
                required: true,
                message: '不能为空',
              },
            ]}
          >
            <Input placeholder='' />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default CategoryPage;
