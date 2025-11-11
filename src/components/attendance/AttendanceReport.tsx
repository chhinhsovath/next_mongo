'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  DatePicker,
  Space,
  Typography,
  Table,
  Statistic,
  Row,
  Col,
  Tag,
  message,
  Spin,
} from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;
const { RangePicker } = DatePicker;
const CAMBODIA_TZ = 'Asia/Phnom_Penh';

interface AttendanceReportProps {
  employeeId?: string;
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

export default function AttendanceReport({ employeeId }: AttendanceReportProps) {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    if (!dateRange || dateRange.length !== 2) {
      message.error('Please select a date range');
      return;
    }

    setLoading(true);
    try {
      const [start, end] = dateRange;
      const startDate = start.format('YYYY-MM-DD');
      const endDate = end.format('YYYY-MM-DD');

      let url = `/api/attendance/report?start_date=${startDate}&end_date=${endDate}`;
      if (employeeId) {
        url += `&employee_id=${employeeId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportData(data.data);
      message.success('Report generated successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'work_date',
      key: 'work_date',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Employee',
      key: 'employee',
      render: (_: any, record: any) => {
        if (record.employee_id) {
          return `${record.employee_id.first_name} ${record.employee_id.last_name} (${record.employee_id.employee_code})`;
        }
        return '-';
      },
    },
    {
      title: 'Check In',
      dataIndex: 'check_in_time',
      key: 'check_in_time',
      render: (time: string) =>
        time ? dayjs(time).tz(CAMBODIA_TZ).format('h:mm A') : '-',
    },
    {
      title: 'Check Out',
      dataIndex: 'check_out_time',
      key: 'check_out_time',
      render: (time: string) =>
        time ? dayjs(time).tz(CAMBODIA_TZ).format('h:mm A') : '-',
    },
    {
      title: 'Work Hours',
      dataIndex: 'work_hours',
      key: 'work_hours',
      render: (hours: number) => (hours ? `${hours}h` : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'attendance_status',
      key: 'attendance_status',
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>
            <FileTextOutlined /> Attendance Report
          </Title>
        </div>

        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
            format="YYYY-MM-DD"
          />
          <Button type="primary" onClick={generateReport} loading={loading}>
            Generate Report
          </Button>
          {reportData && (
            <Button icon={<DownloadOutlined />} disabled>
              Export PDF
            </Button>
          )}
        </Space>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" tip="Generating report..." />
          </div>
        )}

        {reportData && !loading && (
          <>
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Records"
                    value={reportData.statistics.total_records}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Present"
                    value={reportData.statistics.present_count}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Late"
                    value={reportData.statistics.late_count}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Absent"
                    value={reportData.statistics.absent_count}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Half Day"
                    value={reportData.statistics.half_day_count}
                    prefix={<MinusCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Work Hours"
                    value={reportData.statistics.total_work_hours}
                    suffix="h"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Average Work Hours"
                    value={reportData.statistics.average_work_hours}
                    suffix="h"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Attendance Rate"
                    value={reportData.statistics.attendance_rate}
                    suffix="%"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={reportData.records}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </Space>
    </Card>
  );
}
