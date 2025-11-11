'use client';

import { Spin, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
}

export default function LoadingState({ 
  message = 'Loading...', 
  size = 'default',
  fullScreen = false 
}: LoadingStateProps) {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24 }} spin />;

  const content = (
    <Space direction="vertical" align="center" style={{ width: '100%' }}>
      <Spin indicator={antIcon} size={size} />
      {message && <div style={{ marginTop: 8, color: '#666' }}>{message}</div>}
    </Space>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        width: '100%',
      }}
    >
      {content}
    </div>
  );
}
