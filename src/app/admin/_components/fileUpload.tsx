import React, { useEffect, useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, Button } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { v4 as uuidv4 } from 'uuid';

const beforeUpload = (file: RcFile) => {
  const isPdf = file.type === 'application/pdf';
  if (!isPdf) {
    message.error('You can only upload PDF file!');
  }
  const isLt5M = file.size / 1024 / 1024 < 12;
  if (!isLt5M) {
    message.error('File must smaller than 8MB!');
  }
  return isPdf && isLt5M;
};

// 组件接受的属性
type Props = {
  fileUrl: string;
  setFileUrl: any;
};

const FileUpload = ({ fileUrl, setFileUrl }: Props) => {
  const [loading, setLoading] = useState(false);
  const [uploadData, setUploadData] = useState<any>({ key: '', token: '' });

  useEffect(() => {
    const key = uuidv4() + '.pdf';
    fetch(`/api/admin/upload/token?key=${key}`)
      .then((res) => res.json())
      .then((res) => {
        setUploadData({
          key: key,
          token: res.token
        });
      });
  }, []);

  // 文件选择改变之后执行
  const handleChange: UploadProps['onChange'] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setFileUrl(uploadData.key);
      setLoading(false);
    }
  };

  const cdn = process.env.NEXT_PUBLIC_CDN;

  const uploadButton = (
    <Button icon={loading ? <LoadingOutlined /> : <PlusOutlined />}>
      {loading ? 'Uploading' : 'Upload PDF'}
    </Button>
  );

  return (
    <>
      <Upload
        name='file'
        className='file-uploader'
        showUploadList={false}
        action='https://upload-na0.qiniup.com'
        data={uploadData}
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {fileUrl ? (
          <div>
            <a href={cdn + fileUrl} target='_blank' rel='noopener noreferrer'>
              View Uploaded File
            </a>
            <Button onClick={() => setFileUrl('')} style={{ marginLeft: 8 }}>
              Replace File
            </Button>
          </div>
        ) : (
          uploadButton
        )}
      </Upload>
    </>
  );
};

export default FileUpload;