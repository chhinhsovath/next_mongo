'use client';

import '@ant-design/v5-patch-for-react-19';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ConfigProvider, App } from 'antd';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import { Toaster } from '@/components/ui/toast-provider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AuthProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#667eea',
                borderRadius: 6,
              },
            }}
          >
            <App>
              {children}
              <Toaster />
            </App>
          </ConfigProvider>
        </AuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
