'use client';

/**
 * Session Timeout Component
 * Monitors user activity and handles session timeout
 */

import { useEffect, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { Modal, Button } from 'antd';
import { SessionActivityTracker, SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '@/lib/security/session';

export function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const handleTimeout = useCallback(() => {
    // Sign out user
    signOut({ callbackUrl: '/login?session=expired' });
  }, []);
  
  const handleExtendSession = useCallback(() => {
    setShowWarning(false);
    // Activity tracker will automatically reset on user interaction
  }, []);
  
  useEffect(() => {
    // Initialize activity tracker
    const tracker = new SessionActivityTracker(handleTimeout);
    
    // Check for warning threshold
    const warningInterval = setInterval(() => {
      const remaining = tracker.getTimeRemaining();
      
      if (remaining <= SESSION_WARNING_MS && remaining > 0) {
        setShowWarning(true);
        setTimeRemaining(Math.ceil(remaining / 1000));
      } else if (remaining === 0) {
        setShowWarning(false);
      }
    }, 1000);
    
    return () => {
      tracker.destroy();
      clearInterval(warningInterval);
    };
  }, [handleTimeout]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Modal
      title="Session Expiring Soon"
      open={showWarning}
      onCancel={handleExtendSession}
      footer={[
        <Button key="logout" onClick={handleTimeout}>
          Logout Now
        </Button>,
        <Button key="extend" type="primary" onClick={handleExtendSession}>
          Continue Session
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      <p>
        Your session will expire in <strong>{formatTime(timeRemaining)}</strong> due to inactivity.
      </p>
      <p>
        Click "Continue Session" to stay logged in, or "Logout Now" to end your session.
      </p>
    </Modal>
  );
}
