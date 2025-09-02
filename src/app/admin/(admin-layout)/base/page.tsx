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
import VideoUpload from '../../_components/videoUpload';
import FileUpload from '../../_components/fileUpload';
import { useRouter } from 'next/navigation';

// Only import the rich text editor on the client side, not during compilation
const MyEditor = dynamic(() => import('../../_components/MyEditor'), {
  ssr: false,
});

type Base = {
  _id: string;
  title: string;
  desc: string;
  logo: string;
  content: string;
  key: string;
  facebook: string;
  instagram: string;
  xhs: string;
  tiktok: string;
  story: string;
  hours: string;
  locations: string;
  contact: string;
  video: string;
  terms: string;
  policy: string;
  cookie: string;
  menu: string;
  background_img: string;
  collect: string;
  book: string;
  order: string;
  address: string;
  phone: string;
  email: string;
};

function BasePage() {
  const [base, setBase] = useState<Base>({
    _id: '',
    title: '',
    desc: '',
    logo: '',
    content: '',
    key: '',
    facebook: '',
    instagram: '',
    xhs: '',
    tiktok: '',
    story: '',
    hours: '',
    locations: '',
    contact: '',
    video: '',
    terms: '',
    policy: '',
    cookie: '',
    menu: '',
    background_img: '',
    collect: '',
    book: '',
    order: '',
    address: '',
    phone: '',
    email: '',
  });
  const [myForm] = Form.useForm(); // Get Form component
  const nav = useRouter();
  const [currentId, setCurrentId] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [locations, setLocations] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [terms, setTerms] = useState<string>('');
  const [policy, setPolicy] = useState<string>('');
  const [cookie, setCookie] = useState<string>('');
  // Image path
  const [logo, setLogo] = useState<string>('');
  // Editor content
  const [video, setVideo] = useState<string>('');
  const [menu, setMenu] = useState<string>('');
  const [background_img, setBackgroundImg] = useState<string>('');
 
  // If it exists, it means modification, if it does not exist, it means addition
  const cdn = process.env.NEXT_PUBLIC_CDN;

  // Listen for changes in query conditions
  useEffect(() => {
    fetch(`/api/admin/base`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.data) {
          const res = data.data.data;
          setBase(res);
          myForm.setFieldsValue(res);
          setCurrentId(res._id);
          setLogo(res.logo);
          setStory(res.story);
          setHours(res.hours);
          setLocations(res.locations);
          setContact(res.contact);
          setVideo(res.video);
          setTerms(res.terms);
          setPolicy(res.policy);
          setCookie(res.cookie);
          setMenu(res.menu);
          setBackgroundImg(res.background_img);
        }
      });
  }, []);

  const handleSubmit = async (values: Base) => {
    if (currentId) {
      // 修改
      await fetch('/api/admin/base/' + currentId, {
        body: JSON.stringify({
          ...values,
          logo: logo,
          story: story,
          hours: hours,
          locations: locations,
          contact: contact,
          video: video,
          terms: terms,
          policy: policy,
          cookie: cookie,
          menu: menu,
          background_img: background_img,
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
      await fetch('/api/admin/base', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          loto: logo,
          story: story,
          hours: hours,
          locations: locations,
          contact: contact,
          video: video,
          terms: terms,
          policy: policy,
          cookie: cookie,
          menu: menu,
          background_img: background_img,
        }),
      }).then((res) => res.json())
        .then((res) => {
          if (!res.success) {
            message.error(res.errorMessage);
          }
        });
    }
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
        <Form.Item label='Description' name='desc'>
          <Input.TextArea placeholder='Please enter the description' />
        </Form.Item>
        <Form.Item label='Key' name='key'>
          <Input placeholder='Please enter the key' />
        </Form.Item>
        {/* <Form.Item label='Logo' name='logo'>
          <MyUpload imageUrl={logo} setImageUrl={setLogo} />
        </Form.Item> */}
        {/* <Form.Item label='Video' name='video'>
          <VideoUpload fileUrl={video} setFileUrl={setVideo} />
        </Form.Item> */}
        <Form.Item label='Menu' name='menu'>
          <FileUpload fileUrl={menu} setFileUrl={setMenu} />
        </Form.Item>
        <Form.Item label='Image' name='background_img'>
          <MyUpload imageUrl={background_img} setImageUrl={setBackgroundImg} />
        </Form.Item>
        {/* <Form.Item label='Collect Url' name='collect'>
          <Input placeholder='Please enter the collect url' />
        </Form.Item> */}
        <Form.Item label='Book Url' name='book'>
          <Input placeholder='Please enter the book url' />
        </Form.Item>
        {/* <Form.Item label='Order Url' name='order'>
          <Input placeholder='Please enter the order url' />
        </Form.Item> */}
        <Form.Item label='Opening hours' name='hours'>
          <MyEditor html={hours} setHtml={setHours} />
        </Form.Item>
        <Form.Item label='Locations' name='locations'>
          <MyEditor html={locations} setHtml={setLocations} />
        </Form.Item>
        <Form.Item label='Contact' name='contact'>
          <MyEditor html={contact} setHtml={setContact} />
        </Form.Item>
        <Form.Item label='Facebook' name='facebook'>
          <Input placeholder='Please enter the Facebook link' />
        </Form.Item>
        <Form.Item label='Instagram' name='instagram'>
          <Input placeholder='Please enter the Instagram link' />
        </Form.Item>
        <Form.Item label='Xiaohongshu' name='xhs'>
          <Input placeholder='Please enter the Xiaohongshu link' />
        </Form.Item>
        <Form.Item label='TikTok' name='tiktok'>
          <Input placeholder='Please enter the TikTok link' />
        </Form.Item>
        {/* <Form.Item label='Terms' name='terms'>
          <MyEditor html={terms} setHtml={setTerms} />
        </Form.Item> */}
        {/* <Form.Item label='Policy' name='policy'>
          <MyEditor html={policy} setHtml={setPolicy} />
        </Form.Item> */}
        {/* <Form.Item label='Cookie' name='cookie'>
          <MyEditor html={cookie} setHtml={setCookie} />
        </Form.Item> */}
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </Card>
  );
}

export default BasePage;
