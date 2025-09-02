import React, { useEffect, useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, Input, Button, Row, Col } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { v4 as uuidv4 } from 'uuid';

const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

// 组件接受的属性
type Props = {
  imgs: { url: string; desc: string; width: number; height: number }[];
  setImgs: any;
  onImageLoad: (url: string, index: number) => void;
};

const UploadImgs = ({ imgs, setImgs, onImageLoad }: Props) => {
  const [loading, setLoading] = useState(false);
  const [uploadData, setUploadData] = useState<any>({ key: '', token: '' });
  const [desc, setDesc] = useState('');

  const fetchUploadToken = async () => {
    const key = uuidv4();
    const res = await fetch(`/api/admin/upload/token?key=${key}`);
    const data = await res.json();
    setUploadData({
      key,
      token: data.token
    });
  };

  useEffect(() => {
    fetchUploadToken();
  }, []);

  const handleRemove = (index: number) => {
    const newImgs = imgs.filter((_, i) => i !== index);
    setImgs(newImgs);
  };

  const handleChange = async (info: UploadChangeParam<UploadFile<any>>, index: number) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const newImgs = [...imgs];
      newImgs[index].url = uploadData.key;
      setImgs(newImgs);
      setLoading(false);
      onImageLoad(cdn + uploadData.key, index);
      await fetchUploadToken(); // 获取新的上传token
    }
  };

  const cdn = process.env.NEXT_PUBLIC_CDN;

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const addNewImg = () => {
    setImgs([...imgs, { url: '', desc: '' }]);
  };

  return (
    <>
      <Button onClick={addNewImg} style={{ marginBottom: 16 }}>
        Add New Image
      </Button>
      <Row gutter={[16, 16]}>
        {imgs.map((img, index) => (
          <Col key={index} span={6}>
            <div style={{ marginBottom: 16 }}>
              <Upload
                name='file'
                listType='picture-card'
                className='avatar-uploader'
                showUploadList={false}
                action='https://upload-na0.qiniup.com'
                data={uploadData}
                beforeUpload={beforeUpload}
                onChange={(info) => handleChange(info, index)}
              >
                {img.url ? (
                  <img src={cdn + img.url} alt='avatar' style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
              <Input
                placeholder="Enter description"
                value={img.desc}
                onChange={(e) => {
                  const newImgs = [...imgs];
                  newImgs[index].desc = e.target.value;
                  setImgs(newImgs);
                }}
                style={{ marginBottom: 8 }}
              />
              <Button onClick={() => handleRemove(index)}>Remove</Button>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default UploadImgs;