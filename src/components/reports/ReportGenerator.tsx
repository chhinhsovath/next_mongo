'use client';

import { useState } from 'react';
import {
  Card,
  Select,
  DatePicker,
  Button,
  Table,
  Spin,
  message,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  HeadcountReportData,
  LeaveUtilizationReportData,
  AttendanceSummaryReportData,
  PayrollSummaryReportData,
} from '@/services/reportService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ReportType = 'headcount' | 'leave_utilization' | 'attendance_summary' | 'payroll_summary';

interface ReportGeneratorProps {}

export default function ReportGenerator({}: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>('headcount');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [payrollMonth, setPayrollMonth] = useState<dayjs.Dayjs | null>(null);

  const reportOptions = [
    { value: 'headcount', label: 'Employee Headcount Report' },
    { value: 'leave_utilization', label: 'Leave Utilization Report' },
    { value: 'attendance_summary', label: 'Attendance Summary Report' },
    { value: 'payroll_summary', label: 'Payroll Summary Report' },
  ];

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);

    try {
      let url = `/api/reports/${reportType.replace('_', '-')}`;
      const params = new URLSearchParams();

      if (reportType === 'leave_utilization' && dateRange) {
        params.append('start_date', dateRange[0].format('YYYY-MM-DD'));
        params.append('end_date', dateRange[1].format('YYYY-MM-DD'));
      } else if (reportType === 'attendance_summary') {
        if (!dateRange) {
          message.error('Please select a date range');
          setLoading(false);
          return;
        }
        params.append('start_date', dateRange[0].format('YYYY-MM-DD'));
        params.append('end_date', dateRange[1].format('YYYY-MM-DD'));
      } else if (reportType === 'payroll_summary') {
        if (!payrollMonth) {
          message.error('Please select a payroll month');
          setLoading(false);
          return;
        }
        params.append('payroll_month', payrollMonth.format('YYYY-MM'));
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
        message.success('Report generated successfully');
      } else {
        message.error(result.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    message.info('PDF export functionality will be implemented');
    // TODO: Implement PDF export using jsPDF or similar library
  };

  const exportToExcel = async () => {
    if (!reportData) {
      message.error('No report data to export');
      return;
    }

    try {
      // Convert report data to CSV format
      let csvContent = '';
      let filename = `${reportType}_report_${dayjs().format('YYYY-MM-DD')}.csv`;

      if (reportType === 'headcount') {
        const data = reportData as HeadcountReportData;
        csvContent = 'Employee Headcount Report\n\n';
        csvContent += `Total Employees,${data.total_employees}\n\n`;
        
        csvContent += 'By Department\n';
        csvContent += 'Department,Employee Count\n';
        data.by_department.forEach((dept) => {
          csvContent += `${dept.department_name},${dept.employee_count}\n`;
        });
        
        csvContent += '\nBy Position\n';
        csvContent += 'Position,Employee Count\n';
        data.by_position.forEach((pos) => {
          csvContent += `${pos.position_name},${pos.employee_count}\n`;
        });
      } else if (reportType === 'leave_utilization') {
        const data = reportData as LeaveUtilizationReportData;
        csvContent = 'Leave Utilization Report\n\n';
        csvContent += 'Employee Code,Employee Name,Leave Type,Total Quota,Used Days,Remaining Days,Utilization Rate\n';
        data.by_employee.forEach((emp) => {
          csvContent += `${emp.employee_code},${emp.employee_name},${emp.leave_type},${emp.total_quota},${emp.used_days},${emp.remaining_days},${emp.utilization_rate.toFixed(2)}%\n`;
        });
      } else if (reportType === 'attendance_summary') {
        const data = reportData as AttendanceSummaryReportData;
        csvContent = 'Attendance Summary Report\n\n';
        csvContent += 'Employee Code,Employee Name,Total Days,Present,Late,Absent,Half Day,Work Hours,Attendance Rate\n';
        data.by_employee.forEach((emp) => {
          csvContent += `${emp.employee_code},${emp.employee_name},${emp.total_days},${emp.present_days},${emp.late_days},${emp.absent_days},${emp.half_days},${emp.total_work_hours},${emp.attendance_rate.toFixed(2)}%\n`;
        });
      } else if (reportType === 'payroll_summary') {
        const data = reportData as PayrollSummaryReportData;
        csvContent = 'Payroll Summary Report\n\n';
        csvContent += 'Employee Code,Employee Name,Department,Base Salary,Allowances,Bonuses,Overtime,Deductions,Net Salary\n';
        data.by_employee.forEach((emp) => {
          csvContent += `${emp.employee_code},${emp.employee_name},${emp.department_name},${emp.base_salary},${emp.allowances},${emp.bonuses},${emp.overtime_pay},${emp.deductions},${emp.net_salary}\n`;
        });
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Failed to export report');
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    if (reportType === 'headcount') {
      return <HeadcountReportView data={reportData} />;
    } else if (reportType === 'leave_utilization') {
      return <LeaveUtilizationReportView data={reportData} />;
    } else if (reportType === 'attendance_summary') {
      return <AttendanceSummaryReportView data={reportData} />;
    } else if (reportType === 'payroll_summary') {
      return <PayrollSummaryReportView data={reportData} />;
    }

    return null;
  };

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>
              <FileTextOutlined /> Report Generator
            </Title>
            <Text type="secondary">
              Generate various HR reports with customizable filters
            </Text>
          </div>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Text strong>Report Type</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={reportType}
                onChange={(value) => {
                  setReportType(value);
                  setReportData(null);
                }}
                options={reportOptions}
              />
            </Col>

            {reportType === 'leave_utilization' && (
              <Col xs={24} md={8}>
                <Text strong>Date Range (Optional)</Text>
                <RangePicker
                  style={{ width: '100%', marginTop: 8 }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                />
              </Col>
            )}

            {reportType === 'attendance_summary' && (
              <Col xs={24} md={8}>
                <Text strong>Date Range</Text>
                <RangePicker
                  style={{ width: '100%', marginTop: 8 }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                />
              </Col>
            )}

            {reportType === 'payroll_summary' && (
              <Col xs={24} md={8}>
                <Text strong>Payroll Month</Text>
                <DatePicker
                  picker="month"
                  style={{ width: '100%', marginTop: 8 }}
                  value={payrollMonth}
                  onChange={(date) => setPayrollMonth(date)}
                  format="YYYY-MM"
                />
              </Col>
            )}
          </Row>

          <Space>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={generateReport}
              loading={loading}
            >
              Generate Report
            </Button>

            {reportData && (
              <>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={exportToPDF}
                >
                  Export PDF
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={exportToExcel}
                >
                  Export Excel
                </Button>
              </>
            )}
          </Space>
        </Space>
      </Card>

      {loading && (
        <Card style={{ marginTop: 16, textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Generating report...</Text>
          </div>
        </Card>
      )}

      {reportData && !loading && (
        <Card style={{ marginTop: 16 }}>
          {renderReportContent()}
        </Card>
      )}
    </div>
  );
}

function HeadcountReportView({ data }: { data: HeadcountReportData }) {
  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
    },
    {
      title: 'Employee Count',
      dataIndex: 'employee_count',
      key: 'employee_count',
    },
  ];

  const positionColumns = [
    {
      title: 'Position',
      dataIndex: 'position_name',
      key: 'position_name',
    },
    {
      title: 'Employee Count',
      dataIndex: 'employee_count',
      key: 'employee_count',
    },
  ];

  return (
    <div>
      <Title level={4}>Employee Headcount Report</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Employees"
              value={data.total_employees}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider>By Department</Divider>
      <Table
        dataSource={data.by_department}
        columns={departmentColumns}
        rowKey="department_id"
        pagination={false}
      />

      <Divider>By Position</Divider>
      <Table
        dataSource={data.by_position}
        columns={positionColumns}
        rowKey="position_id"
        pagination={false}
      />
    </div>
  );
}

function LeaveUtilizationReportView({ data }: { data: LeaveUtilizationReportData }) {
  const columns = [
    {
      title: 'Employee Code',
      dataIndex: 'employee_code',
      key: 'employee_code',
    },
    {
      title: 'Employee Name',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: 'Leave Type',
      dataIndex: 'leave_type',
      key: 'leave_type',
    },
    {
      title: 'Total Quota',
      dataIndex: 'total_quota',
      key: 'total_quota',
    },
    {
      title: 'Used Days',
      dataIndex: 'used_days',
      key: 'used_days',
    },
    {
      title: 'Remaining Days',
      dataIndex: 'remaining_days',
      key: 'remaining_days',
    },
    {
      title: 'Utilization Rate',
      dataIndex: 'utilization_rate',
      key: 'utilization_rate',
      render: (rate: number) => `${rate.toFixed(2)}%`,
    },
  ];

  return (
    <div>
      <Title level={4}>Leave Utilization Report</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={data.summary.total_leave_requests}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved"
              value={data.summary.approved_requests}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={data.summary.pending_requests}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={data.summary.rejected_requests}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={data.by_employee}
        columns={columns}
        rowKey={(record) => `${record.employee_id}-${record.leave_type}`}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

function AttendanceSummaryReportView({ data }: { data: AttendanceSummaryReportData }) {
  const columns = [
    {
      title: 'Employee Code',
      dataIndex: 'employee_code',
      key: 'employee_code',
    },
    {
      title: 'Employee Name',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: 'Present',
      dataIndex: 'present_days',
      key: 'present_days',
    },
    {
      title: 'Late',
      dataIndex: 'late_days',
      key: 'late_days',
    },
    {
      title: 'Absent',
      dataIndex: 'absent_days',
      key: 'absent_days',
    },
    {
      title: 'Half Day',
      dataIndex: 'half_days',
      key: 'half_days',
    },
    {
      title: 'Work Hours',
      dataIndex: 'total_work_hours',
      key: 'total_work_hours',
      render: (hours: number) => hours.toFixed(2),
    },
    {
      title: 'Attendance Rate',
      dataIndex: 'attendance_rate',
      key: 'attendance_rate',
      render: (rate: number) => `${rate.toFixed(2)}%`,
    },
  ];

  return (
    <div>
      <Title level={4}>Attendance Summary Report</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Attendance Rate"
              value={data.summary.average_attendance_rate}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Absences"
              value={data.summary.total_absences}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Late Arrivals"
              value={data.summary.total_late_arrivals}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={data.by_employee}
        columns={columns}
        rowKey="employee_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

function PayrollSummaryReportView({ data }: { data: PayrollSummaryReportData }) {
  const employeeColumns = [
    {
      title: 'Employee Code',
      dataIndex: 'employee_code',
      key: 'employee_code',
    },
    {
      title: 'Employee Name',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
    },
    {
      title: 'Base Salary',
      dataIndex: 'base_salary',
      key: 'base_salary',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: 'Allowances',
      dataIndex: 'allowances',
      key: 'allowances',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: 'Bonuses',
      dataIndex: 'bonuses',
      key: 'bonuses',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: 'Overtime',
      dataIndex: 'overtime_pay',
      key: 'overtime_pay',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: 'Deductions',
      dataIndex: 'deductions',
      key: 'deductions',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: 'Net Salary',
      dataIndex: 'net_salary',
      key: 'net_salary',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
  ];

  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
    },
    {
      title: 'Employees',
      dataIndex: 'employee_count',
      key: 'employee_count',
    },
    {
      title: 'Total Base Salary',
      dataIndex: 'total_base_salary',
      key: 'total_base_salary',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: 'Total Net Salary',
      dataIndex: 'total_net_salary',
      key: 'total_net_salary',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Title level={4}>Payroll Summary Report</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={data.summary.total_employees}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Base Salary"
              value={data.summary.total_base_salary}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Deductions"
              value={data.summary.total_deductions}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Net Salary"
              value={data.summary.total_net_salary}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider>By Department</Divider>
      <Table
        dataSource={data.by_department}
        columns={departmentColumns}
        rowKey="department_id"
        pagination={false}
        style={{ marginBottom: 24 }}
      />

      <Divider>By Employee</Divider>
      <Table
        dataSource={data.by_employee}
        columns={employeeColumns}
        rowKey="employee_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
