'use client';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  message,
} from 'antd';
import dynamic from 'next/dynamic';
import MyUpload from '../../_components/MyUpload';
import FileUpload from '../../_components/fileUpload';
import VideoUpload from '../../_components/videoUpload';
import UploadImgs from '../../_components/uploadImgs'
import { useRouter } from 'next/navigation';

// Only import the rich text editor on the client side, not during compilation
const MyEditor = dynamic(() => import('../../_components/MyEditor'), {
  ssr: false,
});

type Base = {
  _id: string;
  title: string;
  imgs: [{
    url: string,
    desc: string,
    width: number,
    height: number,
  }],
  menu: string;
  deliveroo: string;
  booking: string;
  type: '';
  hours: string;
  location: string;
  contact: string;
  video: string;
  policy: string;
  menu_pic: string;
  menu_icon: string;
  deliveroo_pic: string;
  deliveroo_icon: string;
};

function WestPage() {
  const [base, setBase] = useState<Base>({
    _id: '',
    title: '',
    imgs: [{url: '', desc: '', width: 0, height: 0}],
    menu: '',
    deliveroo: '',
    booking: '',
    type: '',
    hours: '',
    location: '',
    contact: '',
    video: '',
    policy: '',
    menu_pic: '',
    menu_icon: '',
    deliveroo_pic: '',
    deliveroo_icon: '',
  });
  const [myForm] = Form.useForm(); // Get Form component
  const nav = useRouter();
  const [currentId, setCurrentId] = useState<string>('');
  const [menu, setMenu] = useState<string>('');
  // Image path
  const [imgs, setImgs] = useState<{ url: string; desc: string; width: number; height: number }[]>([]);
  // Editor content
  const [hours, setHours] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [video, setVideo] = useState<string>('');
  const [policy, setPolicy] = useState<string>('');
  const [menu_pic, setMenuPic] = useState<string>('');
  const [menu_icon, setMenuIcon] = useState<string>('');
  const [deliveroo_pic, setDeliverooPic] = useState<string>('');
  const [deliveroo_icon, setDeliverooIcon] = useState<string>('');
  // If it exists, it means modification, if it does not exist, it means addition
  const cdn = process.env.NEXT_PUBLIC_CDN;

  // Listen for changes in query conditions
  useEffect(() => {
    fetch(`/api/admin/product?type=west`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.data) {
          const res = data.data.data;
          setBase(res);
          myForm.setFieldsValue(res);
          setCurrentId(res._id);
          setImgs(res.imgs);
          setMenu(res.menu);
          setHours(res.hours);
          setLocation(res.location);
          setContact(res.contact);
          setVideo(res.video);
          setPolicy(res.policy);
          setMenuPic(res.menu_pic);
          setMenuIcon(res.menu_icon);
          setDeliverooPic(res.deliveroo_pic);
          setDeliverooIcon(res.deliveroo_icon);
        }
      });
  }, []);

  const handleSubmit = async (values: Base) => {
    if (currentId) {
      // 修改
      await fetch('/api/admin/product/' + currentId, {
        body: JSON.stringify({
          ...values,
          menu: menu,
          imgs: imgs,
          hours: hours,
          location: location,
          contact: contact,
          video: video,
          policy: policy,
          menu_pic: menu_pic,
          menu_icon: menu_icon,
          deliveroo_pic: deliveroo_pic,
          deliveroo_icon: deliveroo_icon,
        }),
        method: 'PUT',
      }).then((res) => res.json())
        .then((res) => {
          if (!res.success) {
            message.error(res.errorMessage);
          } else {
            message.success('修改成功');
          }
        });
    } else {
      await fetch('/api/admin/product', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          menu: menu,
          imgs: imgs,
          type: 'west',
          hours: hours,
          location: location,
          contact: contact,
          video: video,
          policy: policy,
          menu_pic: menu_pic,
          menu_icon: menu_icon,
          deliveroo_pic: deliveroo_pic,
          deliveroo_icon: deliveroo_icon,
        }),
      }).then((res) => res.json())
        .then((res) => {
          if (!res.success) {
            message.error(res.errorMessage);
          }
        });
    }
  };

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
    <Card>
      <Form
        form={myForm}
        initialValues={base}
        onFinish={async (v) => handleSubmit(v)}
        labelCol={{ span: 4 }} // 设置label宽度
        wrapperCol={{ span: 20 }} // 设置输入框宽度
      >
        <Form.Item label='Title' name='title'>
          <Input placeholder='Please enter the title' />
        </Form.Item>
        <Form.Item label='Deliveroo' name='deliveroo'>
          <Input placeholder='Please enter the Deliveroo' />
        </Form.Item>
        <Form.Item label='Booking' name='booking'>
          <Input placeholder='Please enter the booking' />
        </Form.Item>
        <Form.Item label='Policy' name='policy'>
          <MyEditor html={policy} setHtml={setPolicy} />
        </Form.Item>
        <Form.Item label='Menu Pic'>
          <MyUpload imageUrl={menu_pic} setImageUrl={setMenuPic} />
        </Form.Item>
        <Form.Item label='Menu Icon'>
          <MyUpload imageUrl={menu_icon} setImageUrl={setMenuIcon} />
        </Form.Item>
        <Form.Item label='Deliveroo Pic'>
          <MyUpload imageUrl={deliveroo_pic} setImageUrl={setDeliverooPic} />
        </Form.Item>
        <Form.Item label='Deliveroo Icon'>
          <MyUpload imageUrl={deliveroo_icon} setImageUrl={setDeliverooIcon} />
        </Form.Item>
        <Form.Item label='Hours' name='hours'>
          <MyEditor html={hours} setHtml={setHours} />
        </Form.Item>

        <Form.Item label='Locations' name='locations'>
          <MyEditor html={location} setHtml={setLocation} />
        </Form.Item>

        <Form.Item label='Contact' name='contact'>
          <MyEditor html={contact} setHtml={setContact} />
        </Form.Item>

        <Form.Item label='Imgs'>
          <UploadImgs imgs={imgs} setImgs={setImgs} onImageLoad={handleImageLoad} />
        </Form.Item>

        <Form.Item label='Video'>
          <VideoUpload fileUrl={video} setFileUrl={setVideo} />
        </Form.Item>
        <Form.Item label='Menu' name='menu'>
          <FileUpload fileUrl={menu} setFileUrl={setMenu} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </Card>
  );
}

export default WestPage;
