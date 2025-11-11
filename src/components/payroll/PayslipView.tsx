'use client';

import React, { useRef } from 'react';
import { Modal, Descriptions, Divider, Button, Space, Tag } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PayrollWithEmployee } from '@/types/payroll';

interface PayslipViewProps {
  payroll: PayrollWithEmployee | null;
  visible: boolean;
  onClose: () => void;
}

export default function PayslipView({ payroll, visible, onClose }: PayslipViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!payroll) return null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'approved':
        return 'blue';
      case 'paid':
        return 'green';
      default:
        return 'default';
    }
  };

  // Handle print
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${payroll.employee.employee_code}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #1890ff;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #f0f0f0;
            }
            .label {
              font-weight: 500;
              color: #666;
              width: 40%;
            }
            .value {
              color: #333;
            }
            .total-row {
              font-weight: bold;
              font-size: 16px;
              background-color: #f5f5f5;
            }
            .total-row td {
              padding: 12px 8px;
            }
            .earnings {
              color: #52c41a;
            }
            .deductions {
              color: #ff4d4f;
            }
            .net-salary {
              color: #1890ff;
              font-size: 18px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Calculate totals
  const grossSalary = payroll.base_salary + payroll.allowances + payroll.bonuses + payroll.overtime_pay;
  const totalDeductions = payroll.deductions;
  const netSalary = payroll.net_salary;

  return (
    <Modal
      title="Payslip Details"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print
        </Button>,
      ]}
    >
      <div ref={printRef}>
        <div className="header" style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ margin: 0, color: '#1890ff' }}>Sangapac Company</h1>
          <h2 style={{ margin: '10px 0', color: '#333' }}>Payslip</h2>
          <p style={{ margin: 0, color: '#666' }}>
            Pay Period: {dayjs(payroll.payroll_month, 'YYYY-MM').format('MMMM YYYY')}
          </p>
        </div>

        <div className="section" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
            Employee Information
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Employee Code:
                </td>
                <td className="value" style={{ color: '#333', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {payroll.employee.employee_code}
                </td>
              </tr>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Employee Name:
                </td>
                <td className="value" style={{ color: '#333', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {`${payroll.employee.first_name} ${payroll.employee.last_name}`}
                  {payroll.employee.first_name_khmer && (
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {`${payroll.employee.first_name_khmer} ${payroll.employee.last_name_khmer}`}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Status:
                </td>
                <td className="value" style={{ color: '#333', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <Tag color={getStatusColor(payroll.payroll_status)}>
                    {payroll.payroll_status.toUpperCase()}
                  </Tag>
                </td>
              </tr>
              {payroll.payment_date && (
                <tr>
                  <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    Payment Date:
                  </td>
                  <td className="value" style={{ color: '#333', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    {dayjs(payroll.payment_date).format('MMMM DD, YYYY')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Divider />

        <div className="section" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
            Earnings
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Base Salary:
                </td>
                <td className="value earnings" style={{ color: '#52c41a', padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  {formatCurrency(payroll.base_salary)}
                </td>
              </tr>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Allowances:
                </td>
                <td className="value earnings" style={{ color: '#52c41a', padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  {formatCurrency(payroll.allowances)}
                </td>
              </tr>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Bonuses:
                </td>
                <td className="value earnings" style={{ color: '#52c41a', padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  {formatCurrency(payroll.bonuses)}
                </td>
              </tr>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Overtime Pay:
                </td>
                <td className="value earnings" style={{ color: '#52c41a', padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  {formatCurrency(payroll.overtime_pay)}
                </td>
              </tr>
              <tr className="total-row" style={{ fontWeight: 'bold', fontSize: 16, backgroundColor: '#f5f5f5' }}>
                <td style={{ padding: '12px 8px' }}>Gross Salary:</td>
                <td className="earnings" style={{ color: '#52c41a', padding: '12px 8px', textAlign: 'right' }}>
                  {formatCurrency(grossSalary)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
            Deductions
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="label" style={{ fontWeight: 500, color: '#666', width: '40%', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  Total Deductions:
                </td>
                <td className="value deductions" style={{ color: '#ff4d4f', padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                  {formatCurrency(totalDeductions)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Divider />

        <div className="section">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr className="total-row" style={{ fontWeight: 'bold', fontSize: 18, backgroundColor: '#e6f7ff' }}>
                <td style={{ padding: '15px 8px' }}>Net Salary:</td>
                <td className="net-salary" style={{ color: '#1890ff', fontSize: 18, padding: '15px 8px', textAlign: 'right' }}>
                  {formatCurrency(netSalary)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 30, fontSize: 12, color: '#888', textAlign: 'center' }}>
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>Generated on {dayjs().format('MMMM DD, YYYY')}</p>
        </div>
      </div>
    </Modal>
  );
}
