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
import UploadImgs from '../../_components/uploadImgs';
import FileUpload from '../../_components/fileUpload';
import { useRouter } from 'next/navigation';

// 只在客户端中引入富文本编辑器，不在编译的时候做处理
const MyEditor = dynamic(() => import('../../_components/MyEditor'), {
  ssr: false,
});

type Shop = {
  _id: string;
  name: string,
  logo: string,
  pic: string,
  content: string,
  imgs: [{
    url: string,
    desc: string,
    width: number,
    height: number,
  }],
  address: string,
  phone: string,
  email: string,
  booking: string,
  menu: string,
  lunch: string,
  drink: string,
  kid: string,
};

function ShopPage() {
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Shop[]>([]);
  const [myForm] = Form.useForm(); // 获取Form组件
  const nav = useRouter();
  // 图片路径
  const [logo, setLogo] = useState<string>('');
  const [pic, setPic] = useState<string>('');
  const [imgs, setImgs] = useState<{ url: string; desc: string; width: number; height: number }[]>([]);
  // 编辑器内容
  const [html, setHtml] = useState('');
  const [menu, setMenu] = useState('');
  const [lunch, setLunch] = useState('');
  const [drink, setDrink] = useState('');
  const [kid, setKid] = useState('');
  const [query, setQuery] = useState({
    per: 10,
    page: 1,
    name: '',
  });
  const [currentId, setCurrentId] = useState(''); // 使用一个当前id变量，表示是新增还是修改
  const [total, setTotal] = useState(0);
  // 如果存在表示修改，不存在表示新增

  const cdn = process.env.NEXT_PUBLIC_CDN;

  // 监听查询条件的改变
  useEffect(() => {
    fetch(
      `/api/admin/shops?page=${query.page}&per=${query.per}&name=${query.name}`
    )
      .then((res) => res.json())
      .then((res) => {
        setList(res.data.list);
        setTotal(res.data.total);
      });
  }, [query]);

  useEffect(() => {
    if (!open) {
      setCurrentId('');
      setLogo('');
      setPic('');
      setImgs([]);

      setMenu('');
      setLunch('');
      setDrink('');
      setKid('');

      myForm.resetFields(); // 重置表单

    }
  }, [open]);

  const handleImageLoad = (url: string, index: number) => {
    const img = new Image();
    img.onload = () => {
      const newImgs = [...imgs];
      newImgs[index].width = img.width;
      newImgs[index].height = img.height;
      setImgs(newImgs);
    };
    img.src = url;
  };

  return (
    <Card
      title='餐馆管理'
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
      <Form
        layout='inline'
        onFinish={(v) => {
          setQuery({
            page: 1,
            per: 10,
            name: v.name,
          });
        }}
      >
        <Form.Item label='标题' name='name'>
          <Input placeholder='请输入关键词' />
        </Form.Item>
        <Form.Item>
          <Button icon={<SearchOutlined />} htmlType='submit' type='primary' />
        </Form.Item>
      </Form>
      <Table
        style={{ marginTop: '8px' }}
        dataSource={list}
        rowKey='_id'
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
            title: 'Logo',
            align: 'center',
            width: '100px',
            // dataIndex: 'title',
            render(v, r) {
              return (
                <img
                  src={cdn + r.logo}
                  style={{
                    display: 'block',
                    margin: '8px auto',
                    width: '80px',
                    maxHeight: '80px',
                  }}
                  alt={r.name}
                />
              );
            },
          },
          {
            title: 'Pic',
            align: 'center',
            width: '100px',
            // dataIndex: 'title',
            render(v, r) {
              return (
                <img
                  src={cdn + r.pic}
                  style={{
                    display: 'block',
                    margin: '8px auto',
                    width: '80px',
                    maxHeight: '80px',
                  }}
                  alt={r.pic}
                />
              );
            },
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
                      setLogo(r.logo);
                      setPic(r.pic);
                      setImgs(r.imgs);
                      setMenu(r.menu);
                      setLunch(r.lunch);
                      setDrink(r.drink);
                      setKid(r.kid);

                      myForm.setFieldsValue(r);
                    }}
                  />
                  <Popconfirm
                    title='是否确认删除?'
                    onConfirm={async () => {
                      //
                      await fetch('/api/admin/shops/' + r._id, {
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
              await fetch('/api/admin/shops/' + currentId, {
                body: JSON.stringify({ 
                  ...v, 
                  logo: logo,
                  pic: pic, 
                  imgs: imgs,
                  menu: menu,
                  lunch: lunch,
                  drink: drink,
                  kid: kid,

                }),
                method: 'PUT',
              }).then((res) => res.json());
            } else {
              await fetch('/api/admin/shops', {
                method: 'POST',
                body: JSON.stringify({ 
                  ...v, 
                  logo: logo, 
                  pic: pic,
                  imgs: imgs,
                  menu: menu,
                  lunch: lunch,
                  drink: drink,
                  kid: kid,

                }),
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
            label='Name'
            name='name'
          >
            <Input placeholder='请输入标题' />
          </Form.Item>
          <Form.Item
            label='Content'
            name='content'
          >
            <Input.TextArea placeholder='请输入内容' />
          </Form.Item>
          <Form.Item label='Logo'>
            <MyUpload imageUrl={logo} setImageUrl={setLogo} />
          </Form.Item>
          <Form.Item label='Pic'>
            <MyUpload imageUrl={pic} setImageUrl={setPic} />
          </Form.Item>
          <Form.Item label='Imgs'>
            <UploadImgs imgs={imgs} setImgs={setImgs} onImageLoad={handleImageLoad} />
          </Form.Item>
          <Form.Item label='Address' name='address'>
            <Input.TextArea placeholder='请输入地址' />
          </Form.Item>
          <Form.Item label='Phone' name='phone'>
            <Input placeholder='请输入电话' />
          </Form.Item>
          <Form.Item label='Email' name='email'>
            <Input placeholder='请输入邮箱' />
          </Form.Item>
          <Form.Item label='Booking' name='booking'>
            <Input placeholder='请输入预定' />
          </Form.Item>
          <Form.Item label='Menu'>
            <FileUpload fileUrl={menu} setFileUrl={setMenu} />
          </Form.Item>
          <Form.Item label='Lunch'>
            <FileUpload fileUrl={lunch} setFileUrl={setLunch} />
          </Form.Item>
          <Form.Item label='Drink'>
            <FileUpload fileUrl={drink} setFileUrl={setDrink} />
          </Form.Item>
          <Form.Item label='Kid'>
            <FileUpload fileUrl={kid} setFileUrl={setKid} />
          </Form.Item>

        </Form>
      </Modal>
    </Card>
  );
}

export default ShopPage;
