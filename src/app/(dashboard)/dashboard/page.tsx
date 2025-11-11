'use client';

import { Typography, Card, Row, Col, Button, Space, List, Tag, Empty, Avatar, Statistic } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text, Paragraph } = Typography;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch employee details first
  const { data: employeeData, isLoading: loadingEmployee } = useSWR(
    user?.employee_id ? `/api/employees/${user.employee_id}` : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  const employee = employeeData?.employee;

  // Fetch dashboard data with SWR for real-time updates
  const { data: leaveBalances, isLoading: loadingBalances } = useSWR(
    user?.employee_id ? `/api/leave/balance?employee_id=${user.employee_id}` : null,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: leaveRequests, isLoading: loadingLeaves } = useSWR(
    user?.employee_id ? `/api/leave?employee_id=${user.employee_id}&limit=5` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: attendanceData, isLoading: loadingAttendance } = useSWR(
    user?.employee_id
      ? `/api/attendance/${user.employee_id}?start_date=${dayjs().subtract(7, 'days').format('YYYY-MM-DD')}&end_date=${dayjs().format('YYYY-MM-DD')}`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: payrollData, isLoading: loadingPayroll } = useSWR(
    user?.employee_id ? `/api/payroll/${user.employee_id}?limit=1` : null,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (employee) {
      const firstName = employee.first_name_khmer || employee.first_name;
      const lastName = employee.last_name_khmer || employee.last_name;
      return `${firstName} ${lastName}`;
    }
    if (user.employee) {
      const firstName = user.employee.first_name_khmer || user.employee.first_name;
      const lastName = user.employee.last_name_khmer || user.employee.last_name;
      return `${firstName} ${lastName}`;
    }
    return user.username;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      cancelled: 'default',
      present: 'green',
      late: 'orange',
      absent: 'red',
      half_day: 'blue',
    };
    return colors[status] || 'default';
  };

  const formatDate = (date: string | Date) => {
    return dayjs(date).tz('Asia/Phnom_Penh').format('MMM DD, YYYY');
  };

  const formatDateTime = (date: string | Date) => {
    return dayjs(date).tz('Asia/Phnom_Penh').format('MMM DD, YYYY HH:mm');
  };

  // Profile Summary Widget
  const ProfileSummary = () => (
    <Card loading={loadingEmployee}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {getUserDisplayName()}
            </Title>
            <Text type="secondary">{employee?.position_id || 'Employee'}</Text>
            <br />
            <Text type="secondary">{employee?.department_id || ''}</Text>
          </div>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Text strong>Employee Code: </Text>
          <Text>{employee?.employee_code || 'N/A'}</Text>
        </div>
        <div>
          <Text strong>Email: </Text>
          <Text>{employee?.email || 'N/A'}</Text>
        </div>
        <div>
          <Text strong>Status: </Text>
          <Tag color="green">{employee?.employee_status || 'active'}</Tag>
        </div>
      </Space>
    </Card>
  );

  // Leave Balance Summary Widget
  const LeaveBalanceSummary = () => (
    <Card title="Leave Balance" loading={loadingBalances}>
      {leaveBalances?.balances && leaveBalances.balances.length > 0 ? (
        <List
          dataSource={leaveBalances.balances}
          renderItem={(balance: any) => (
            <List.Item>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong>{balance.leave_type_name}</Text>
                  <Text>
                    {balance.remaining_days} / {balance.total_days} days
                  </Text>
                </Space>
                <div
                  style={{
                    width: '100%',
                    height: 8,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(balance.remaining_days / balance.total_days) * 100}%`,
                      height: '100%',
                      backgroundColor: balance.remaining_days > 5 ? '#52c41a' : '#faad14',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </Space>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No leave balance data" />
      )}
    </Card>
  );

  // Recent Attendance Widget
  const RecentAttendance = () => {
    const recentRecords = attendanceData?.attendance_records?.slice(0, 5) || [];
    
    return (
      <Card title="Recent Attendance" loading={loadingAttendance}>
        {recentRecords.length > 0 ? (
          <List
            dataSource={recentRecords}
            renderItem={(record: any) => (
              <List.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <ClockCircleOutlined />
                    <div>
                      <Text strong>{formatDate(record.work_date)}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.check_in_time
                          ? `In: ${dayjs(record.check_in_time).tz('Asia/Phnom_Penh').format('HH:mm')}`
                          : 'No check-in'}
                        {record.check_out_time
                          ? ` | Out: ${dayjs(record.check_out_time).tz('Asia/Phnom_Penh').format('HH:mm')}`
                          : ''}
                      </Text>
                    </div>
                  </Space>
                  <Tag color={getStatusColor(record.attendance_status)}>
                    {record.attendance_status}
                  </Tag>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No attendance records" />
        )}
      </Card>
    );
  };

  // Pending Requests Widget
  const PendingRequests = () => {
    const pendingLeaves = leaveRequests?.leave_requests?.filter(
      (req: any) => req.leave_status === 'pending'
    ) || [];

    return (
      <Card title="Pending Requests" loading={loadingLeaves}>
        {pendingLeaves.length > 0 ? (
          <List
            dataSource={pendingLeaves}
            renderItem={(request: any) => (
              <List.Item>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <CalendarOutlined />
                      <Text strong>Leave Request</Text>
                    </Space>
                    <Tag color={getStatusColor(request.leave_status)}>
                      {request.leave_status}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.total_days} days)
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Submitted: {formatDateTime(request.created_at)}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No pending requests" />
        )}
      </Card>
    );
  };

  // Quick Actions Widget
  const QuickActions = () => (
    <Card title="Quick Actions">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={() => router.push('/leave/requests')}
        >
          Request Leave
        </Button>
        <Button
          icon={<ClockCircleOutlined />}
          block
          onClick={() => router.push('/attendance')}
        >
          View Attendance
        </Button>
        <Button
          icon={<FileTextOutlined />}
          block
          onClick={() => router.push('/payroll')}
        >
          View Payslips
        </Button>
        <Button
          icon={<UserOutlined />}
          block
          onClick={() => router.push(`/employees/${user?.employee_id}`)}
        >
          My Profile
        </Button>
      </Space>
    </Card>
  );

  // Announcements Widget
  const Announcements = () => {
    const announcements = [
      {
        id: 1,
        title: 'Welcome to HRMIS',
        content: 'Welcome to the Sangapac Company HR Management System. Use this dashboard to manage your HR activities.',
        date: new Date(),
        type: 'info',
      },
    ];

    return (
      <Card title={<Space><BellOutlined /> Announcements</Space>}>
        <List
          dataSource={announcements}
          renderItem={(announcement) => (
            <List.Item>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong>{announcement.title}</Text>
                <Paragraph
                  type="secondary"
                  style={{ margin: 0, fontSize: 12 }}
                  ellipsis={{ rows: 2 }}
                >
                  {announcement.content}
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {formatDateTime(announcement.date)}
                </Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  // Recent Leave Requests Widget
  const RecentLeaveRequests = () => {
    const recentLeaves = leaveRequests?.leave_requests?.slice(0, 5) || [];

    return (
      <Card title="Recent Leave Requests" loading={loadingLeaves}>
        {recentLeaves.length > 0 ? (
          <List
            dataSource={recentLeaves}
            renderItem={(request: any) => (
              <List.Item>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>{request.leave_type_id}</Text>
                    <Tag color={getStatusColor(request.leave_status)}>
                      {request.leave_status}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {request.total_days} days
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No leave requests" />
        )}
      </Card>
    );
  };

  // Latest Payslip Widget
  const LatestPayslip = () => {
    const latestPayroll = payrollData?.payroll_records?.[0];

    return (
      <Card title="Latest Payslip" loading={loadingPayroll}>
        {latestPayroll ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Statistic
              title="Net Salary"
              value={latestPayroll.net_salary}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">Period:</Text>
              <Text strong>{latestPayroll.payroll_month}</Text>
            </Space>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">Status:</Text>
              <Tag color={getStatusColor(latestPayroll.payroll_status)}>
                {latestPayroll.payroll_status}
              </Tag>
            </Space>
            <Button
              type="link"
              block
              onClick={() => router.push('/payroll')}
            >
              View Details
            </Button>
          </Space>
        ) : (
          <Empty description="No payroll data" />
        )}
      </Card>
    );
  };

  return (
    <div>
      <Title level={2}>Welcome, {getUserDisplayName()}!</Title>
      <Text type="secondary">
        {dayjs().tz('Asia/Phnom_Penh').format('dddd, MMMM DD, YYYY')}
      </Text>

      {/* Main Dashboard Grid */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Left Column - Profile and Quick Actions */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <ProfileSummary />
            <QuickActions />
          </Space>
        </Col>

        {/* Middle Column - Leave and Attendance */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <LeaveBalanceSummary />
            <PendingRequests />
          </Space>
        </Col>

        {/* Right Column - Recent Activity */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <LatestPayslip />
            <RecentAttendance />
          </Space>
        </Col>
      </Row>

      {/* Bottom Row - Full Width Widgets */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <RecentLeaveRequests />
        </Col>
        <Col xs={24} lg={12}>
          <Announcements />
        </Col>
      </Row>
    </div>
  );
}
