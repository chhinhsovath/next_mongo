'use client';

import { useEffect } from 'react';
import { Alert } from 'antd';
import { showApiError } from '@/lib/notifications';
import { Language } from '@/lib/errorMessages';

interface ApiErrorHandlerProps {
  error?: string | null;
  errorCode?: string;
  language?: Language;
  showNotification?: boolean;
  showAlert?: boolean;
}

/**
 * Component for handling and displaying API errors
 * Can show errors as notifications or inline alerts
 */
export default function ApiErrorHandler({
  error,
  errorCode,
  language = 'en',
  showNotification = false,
  showAlert = true,
}: ApiErrorHandlerProps) {
  useEffect(() => {
    if (error && showNotification) {
      showApiError(errorCode, error, language);
    }
  }, [error, errorCode, language, showNotification]);

  if (!error || !showAlert) {
    return null;
  }

  return (
    <Alert
      message="Error"
      description={error}
      type="error"
      showIcon
      closable
      style={{ marginBottom: 16 }}
    />
  );
}
