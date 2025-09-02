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
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import MyUpload from '../../_components/MyUpload';
import { useRouter } from 'next/navigation';
import moment from 'moment';

// 只在客户端中引入富文本编辑器，不在编译的时候做处理
const MyEditor = dynamic(() => import('../../_components/MyEditor'), {
  ssr: false,
});

type Msg = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
};

function MsgPage() {
  const [loading, setLoading] = useState(false); // 加载状态
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Msg[]>([]);
  const [myForm] = Form.useForm(); // 获取Form组件
  const nav = useRouter();
  // 图片路径
  const [imageUrl, setImageUrl] = useState<string>('');
  // 编辑器内容
  const [html, setHtml] = useState('');

  const [query, setQuery] = useState({
    per: 10,
    page: 1,
    title: '',
  });
  const [currentId, setCurrentId] = useState(''); // 使用一个当前id变量，表示是新增还是修改
  const [total, setTotal] = useState(0);
  // 如果存在表示修改，不存在表示新增

  const cdn = process.env.NEXT_PUBLIC_CDN;

  // 监听查询条件的改变
  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/admin/msg?page=${query.page}&per=${query.per}`
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
      setImageUrl('');
      setHtml('');
    }
  }, [open]);

  return (
    <Card
      title='菜品管理'
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
            title: 'Name',
            dataIndex: 'name',
          },
          {
            title: 'Email',
            dataIndex: 'email',
          },          
          {
            title: 'Create Time',
            dataIndex: 'createdAt',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
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
            // console.log(v);
            if (currentId) {
              // 修改
              await fetch('/api/admin/msg/' + currentId, {
                body: JSON.stringify({ ...v, img: imageUrl }),
                method: 'PUT',
              }).then((res) => res.json());
            } else {
              await fetch('/api/admin/msg', {
                method: 'POST',
                body: JSON.stringify({ ...v, img: imageUrl }),
              }).then((res) => res.json())
                .then((res) => {
                  if (!res.success) {
                    
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
                message: '标题不能为空',
              },
            ]}
          >
            <Input placeholder='' />
          </Form.Item>
          <Form.Item label='图片'>
            <MyUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default MsgPage;
