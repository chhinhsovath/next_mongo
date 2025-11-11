'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Input,
  Select,
  Row,
  Col,
  Descriptions,
  Divider,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import EvaluationForm from '@/components/performance/EvaluationForm';
import PerformanceChart from '@/components/performance/PerformanceChart';
import type { PerformanceEvaluation } from '@/types/performance';

const { Search } = Input;

export default function PerformancePage() {
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchEmployeeId, setSearchEmployeeId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PerformanceEvaluation | undefined>();
  const [formEmployeeId, setFormEmployeeId] = useState<string>('');

  useEffect(() => {
    fetchEvaluations();
  }, [page, pageSize, searchEmployeeId, statusFilter]);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (searchEmployeeId) {
        params.append('employee_id', searchEmployeeId);
      }

      if (statusFilter) {
        params.append('evaluation_status', statusFilter);
      }

      const response = await fetch(`/api/performance?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch evaluations');
      }

      setEvaluations(data.data.evaluations);
      setTotal(data.data.total);
    } catch (error: any) {
      console.error('Error fetching evaluations:', error);
      message.error('Failed to load performance evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (evaluationId: string) => {
    Modal.confirm({
      title: 'Delete Performance Evaluation',
      content: 'Are you sure you want to delete this evaluation? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/performance/${evaluationId}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to delete evaluation');
          }

          message.success('Evaluation deleted successfully');
          fetchEvaluations();
        } catch (error: any) {
          console.error('Error deleting evaluation:', error);
          message.error(error.message || 'Failed to delete evaluation');
        }
      },
    });
  };

  const handleAcknowledge = async (evaluation: PerformanceEvaluation) => {
    try {
      const response = await fetch(`/api/performance/${evaluation.evaluation_id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged_by: evaluation.employee_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to acknowledge evaluation');
      }

      message.success('Evaluation acknowledged successfully');
      fetchEvaluations();
    } catch (error: any) {
      console.error('Error acknowledging evaluation:', error);
      message.error(error.message || 'Failed to acknowledge evaluation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'completed':
        return 'blue';
      case 'acknowledged':
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Evaluation ID',
      dataIndex: 'evaluation_id',
      key: 'evaluation_id',
      width: 150,
    },
    {
      title: 'Employee ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 120,
    },
    {
      title: 'Evaluator ID',
      dataIndex: 'evaluator_id',
      key: 'evaluator_id',
      width: 120,
    },
    {
      title: 'Period',
      key: 'period',
      width: 200,
      render: (_: any, record: PerformanceEvaluation) => (
        <span>
          {dayjs(record.evaluation_period.start).format('MMM DD, YYYY')} -{' '}
          {dayjs(record.evaluation_period.end).format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      title: 'Overall Score',
      dataIndex: 'overall_score',
      key: 'overall_score',
      width: 120,
      render: (score: number) => (
        <Tag color={score >= 4 ? 'green' : score >= 3 ? 'blue' : 'orange'}>
          {score.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'evaluation_status',
      key: 'evaluation_status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: PerformanceEvaluation) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedEvaluation(record);
              setIsViewModalVisible(true);
            }}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedEvaluation(record);
              setIsFormModalVisible(true);
            }}
          >
            Edit
          </Button>
          {record.evaluation_status === 'completed' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleAcknowledge(record)}
            >
              Acknowledge
            </Button>
          )}
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.evaluation_id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Performance Evaluations"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedEvaluation(undefined);
              setFormEmployeeId('');
              setIsFormModalVisible(true);
            }}
          >
            New Evaluation
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Search
              placeholder="Search by Employee ID"
              allowClear
              onSearch={(value) => {
                setSearchEmployeeId(value);
                setPage(1);
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={12}>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => {
                setStatusFilter(value || '');
                setPage(1);
              }}
            >
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="acknowledged">Acknowledged</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={evaluations}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} evaluations`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={selectedEvaluation ? 'Edit Performance Evaluation' : 'New Performance Evaluation'}
        open={isFormModalVisible}
        onCancel={() => {
          setIsFormModalVisible(false);
          setSelectedEvaluation(undefined);
          setFormEmployeeId('');
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EvaluationForm
          evaluation={selectedEvaluation}
          employeeId={formEmployeeId}
          onSuccess={() => {
            setIsFormModalVisible(false);
            setSelectedEvaluation(undefined);
            setFormEmployeeId('');
            fetchEvaluations();
          }}
          onCancel={() => {
            setIsFormModalVisible(false);
            setSelectedEvaluation(undefined);
            setFormEmployeeId('');
          }}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        title="Performance Evaluation Details"
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setSelectedEvaluation(undefined);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsViewModalVisible(false);
              setSelectedEvaluation(undefined);
            }}
          >
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedEvaluation && (
          <Tabs
            items={[
              {
                key: 'details',
                label: 'Details',
                children: (
                  <>
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Evaluation ID" span={2}>
                        {selectedEvaluation.evaluation_id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Employee ID">
                        {selectedEvaluation.employee_id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Evaluator ID">
                        {selectedEvaluation.evaluator_id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Period Start">
                        {dayjs(selectedEvaluation.evaluation_period.start).format('MMM DD, YYYY')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Period End">
                        {dayjs(selectedEvaluation.evaluation_period.end).format('MMM DD, YYYY')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Overall Score" span={2}>
                        <Tag
                          color={
                            selectedEvaluation.overall_score >= 4
                              ? 'green'
                              : selectedEvaluation.overall_score >= 3
                              ? 'blue'
                              : 'orange'
                          }
                          style={{ fontSize: 16 }}
                        >
                          {selectedEvaluation.overall_score.toFixed(2)} / 5.00
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Status" span={2}>
                        <Tag color={getStatusColor(selectedEvaluation.evaluation_status)}>
                          {selectedEvaluation.evaluation_status.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider>Performance Criteria</Divider>
                    {selectedEvaluation.criteria.map((criterion, index) => (
                      <Card key={index} size="small" style={{ marginBottom: 8 }}>
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="Criterion">
                            <strong>{criterion.name}</strong>
                          </Descriptions.Item>
                          <Descriptions.Item label="Description">
                            {criterion.description}
                          </Descriptions.Item>
                          <Descriptions.Item label="Score">
                            <Tag color="blue">{criterion.score} / 5</Tag>
                          </Descriptions.Item>
                          {criterion.comments && (
                            <Descriptions.Item label="Comments">
                              {criterion.comments}
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </Card>
                    ))}

                    {selectedEvaluation.goals && selectedEvaluation.goals.length > 0 && (
                      <>
                        <Divider>Goals</Divider>
                        {selectedEvaluation.goals.map((goal, index) => (
                          <div key={index} style={{ marginBottom: 8 }}>
                            <Tag color={goal.achieved ? 'green' : 'default'}>
                              {goal.achieved ? 'Achieved' : 'Not Achieved'}
                            </Tag>
                            <span style={{ marginLeft: 8 }}>{goal.description}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {selectedEvaluation.overall_comments && (
                      <>
                        <Divider>Overall Comments</Divider>
                        <p>{selectedEvaluation.overall_comments}</p>
                      </>
                    )}

                    {selectedEvaluation.development_plan && (
                      <>
                        <Divider>Development Plan</Divider>
                        <p>{selectedEvaluation.development_plan}</p>
                      </>
                    )}
                  </>
                ),
              },
              {
                key: 'charts',
                label: 'Visualizations',
                children: (
                  <>
                    <PerformanceChart
                      employeeId={selectedEvaluation.employee_id}
                      type="trend"
                    />
                    <div style={{ marginTop: 24 }}>
                      <PerformanceChart
                        employeeId={selectedEvaluation.employee_id}
                        type="radar"
                        evaluation={selectedEvaluation}
                      />
                    </div>
                  </>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
