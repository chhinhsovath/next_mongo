'use client';

import { useState, useEffect } from 'react';
import { Calendar, Badge, Card, Typography, Spin, Tag, Space, Modal } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;
const CAMBODIA_TZ = 'Asia/Phnom_Penh';

interface AttendanceRecord {
  _id: string;
  attendance_id: string;
  work_date: string;
  check_in_time?: string;
  check_out_time?: string;
  work_hours?: number;
  attendance_status: 'present' | 'late' | 'absent' | 'half_day';
  check_in_location_lat?: number;
  check_in_location_lng?: number;
  check_out_location_lat?: number;
  check_out_location_lng?: number;
  notes?: string;
}

interface AttendanceCalendarProps {
  employeeId: string;
}

const statusColors = {
  present: 'success',
  late: 'warning',
  absent: 'error',
  half_day: 'processing',
} as const;

const statusLabels = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  half_day: 'Half Day',
};

export default function AttendanceCalendar({ employeeId }: AttendanceCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, [employeeId, selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Get first and last day of the selected month
      const startDate = selectedDate.startOf('month').format('YYYY-MM-DD');
      const endDate = selectedDate.endOf('month').format('YYYY-MM-DD');

      const response = await fetch(
        `/api/attendance/${employeeId}?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const data = await response.json();
      setRecords(data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecordForDate = (date: Dayjs): AttendanceRecord | undefined => {
    const dateStr = date.format('YYYY-MM-DD');
    return records.find((record) => record.work_date === dateStr);
  };

  const dateCellRender = (date: Dayjs) => {
    const record = getRecordForDate(date);
    
    if (!record) {
      return null;
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <Badge
          status={statusColors[record.attendance_status]}
          text={statusLabels[record.attendance_status]}
        />
        {record.work_hours && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.work_hours}h
          </div>
        )}
      </div>
    );
  };

  const handleDateSelect = (date: Dayjs) => {
    const record = getRecordForDate(date);
    if (record) {
      setSelectedRecord(record);
      setDetailModalVisible(true);
    }
  };

  const handlePanelChange = (date: Dayjs) => {
    setSelectedDate(date);
  };

  return (
    <>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>Attendance Calendar</Title>
            <Space>
              <Badge status="success" text="Present" />
              <Badge status="warning" text="Late" />
              <Badge status="error" text="Absent" />
              <Badge status="processing" text="Half Day" />
            </Space>
          </div>

          <Spin spinning={loading}>
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={handleDateSelect}
              onPanelChange={handlePanelChange}
            />
          </Spin>
        </Space>
      </Card>

      <Modal
        title="Attendance Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>Date: </Text>
              <Text>{dayjs(selectedRecord.work_date).format('MMMM D, YYYY')}</Text>
            </div>

            <div>
              <Text strong>Status: </Text>
              <Tag color={statusColors[selectedRecord.attendance_status]}>
                {statusLabels[selectedRecord.attendance_status]}
              </Tag>
            </div>

            {selectedRecord.check_in_time && (
              <div>
                <Text strong>Check In: </Text>
                <Text>
                  {dayjs(selectedRecord.check_in_time).tz(CAMBODIA_TZ).format('h:mm:ss A')}
                </Text>
                {selectedRecord.check_in_location_lat && selectedRecord.check_in_location_lng && (
                  <div style={{ marginLeft: '20px', fontSize: '12px', color: '#666' }}>
                    Location: {selectedRecord.check_in_location_lat.toFixed(6)},{' '}
                    {selectedRecord.check_in_location_lng.toFixed(6)}
                  </div>
                )}
              </div>
            )}

            {selectedRecord.check_out_time && (
              <div>
                <Text strong>Check Out: </Text>
                <Text>
                  {dayjs(selectedRecord.check_out_time).tz(CAMBODIA_TZ).format('h:mm:ss A')}
                </Text>
                {selectedRecord.check_out_location_lat && selectedRecord.check_out_location_lng && (
                  <div style={{ marginLeft: '20px', fontSize: '12px', color: '#666' }}>
                    Location: {selectedRecord.check_out_location_lat.toFixed(6)},{' '}
                    {selectedRecord.check_out_location_lng.toFixed(6)}
                  </div>
                )}
              </div>
            )}

            {selectedRecord.work_hours !== undefined && (
              <div>
                <Text strong>Work Hours: </Text>
                <Text>{selectedRecord.work_hours} hours</Text>
              </div>
            )}

            {selectedRecord.notes && (
              <div>
                <Text strong>Notes: </Text>
                <Text>{selectedRecord.notes}</Text>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
}
