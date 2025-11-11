'use client';

import { useState } from 'react';
import { Card, Button, Space, Typography, Tag, message, Spin, Alert } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;
const CAMBODIA_TZ = 'Asia/Phnom_Penh';

interface AttendanceFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function AttendanceForm({ employeeId, onSuccess }: AttendanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(dayjs().tz(CAMBODIA_TZ));

  // Update current time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().tz(CAMBODIA_TZ));
    }, 1000);
    return () => clearInterval(interval);
  });

  const captureLocation = async (): Promise<LocationCoords | null> => {
    setLocationLoading(true);
    setLocationError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        setLocationLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setLocationLoading(false);
          resolve(coords);
        },
        (error) => {
          let errorMsg = 'Unable to retrieve location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out';
              break;
          }
          setLocationError(errorMsg);
          setLocationLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // Capture location
      const coords = await captureLocation();

      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          check_in_location_lat: coords?.latitude,
          check_in_location_lng: coords?.longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check in');
      }

      message.success('Checked in successfully!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      // Capture location
      const coords = await captureLocation();

      const response = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          check_out_location_lat: coords?.latitude,
          check_out_location_lng: coords?.longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check out');
      }

      message.success('Checked out successfully!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={3}>
            <ClockCircleOutlined /> Attendance
          </Title>
          <Title level={2} style={{ margin: '20px 0' }}>
            {currentTime.format('HH:mm:ss')}
          </Title>
          <Text type="secondary">{currentTime.format('dddd, MMMM D, YYYY')}</Text>
        </div>

        {locationError && (
          <Alert
            message="Location Error"
            description={locationError}
            type="warning"
            showIcon
            closable
            onClose={() => setLocationError(null)}
          />
        )}

        {location && (
          <div style={{ textAlign: 'center' }}>
            <Tag icon={<EnvironmentOutlined />} color="success">
              Location Captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Tag>
          </div>
        )}

        {locationLoading && (
          <div style={{ textAlign: 'center' }}>
            <Spin tip="Capturing location..." />
          </div>
        )}

        <Space style={{ width: '100%', justifyContent: 'center' }} size="large">
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleCheckIn}
            loading={loading}
            disabled={locationLoading}
          >
            Check In
          </Button>
          <Button
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleCheckOut}
            loading={loading}
            disabled={locationLoading}
          >
            Check Out
          </Button>
        </Space>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            <EnvironmentOutlined /> Location will be captured automatically
          </Text>
        </div>
      </Space>
    </Card>
  );
}
