'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Space,
  Card,
  message,
  Divider,
  Select,
  Switch,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PerformanceEvaluation, PerformanceCriterion } from '@/types/performance';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface EvaluationFormProps {
  evaluation?: PerformanceEvaluation;
  employeeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const defaultCriteria = [
  { name: 'Quality of Work', description: 'Accuracy, thoroughness, and attention to detail' },
  { name: 'Productivity', description: 'Efficiency and ability to meet deadlines' },
  { name: 'Communication', description: 'Clarity and effectiveness in communication' },
  { name: 'Teamwork', description: 'Collaboration and cooperation with colleagues' },
  { name: 'Initiative', description: 'Proactiveness and problem-solving ability' },
];

export default function EvaluationForm({
  evaluation,
  employeeId,
  onSuccess,
  onCancel,
}: EvaluationFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [overallScore, setOverallScore] = useState<number>(0);

  useEffect(() => {
    if (evaluation) {
      form.setFieldsValue({
        employee_id: evaluation.employee_id,
        evaluator_id: evaluation.evaluator_id,
        evaluation_period: [
          dayjs(evaluation.evaluation_period.start),
          dayjs(evaluation.evaluation_period.end),
        ],
        criteria: evaluation.criteria,
        overall_comments: evaluation.overall_comments,
        goals: evaluation.goals,
        development_plan: evaluation.development_plan,
      });
      calculateOverallScore(evaluation.criteria);
    } else if (employeeId) {
      form.setFieldsValue({
        employee_id: employeeId,
        criteria: defaultCriteria.map((c) => ({ ...c, score: 3, comments: '' })),
      });
      calculateOverallScore(defaultCriteria.map((c) => ({ ...c, score: 3, comments: '' })));
    }
  }, [evaluation, employeeId, form]);

  const calculateOverallScore = (criteria: PerformanceCriterion[]) => {
    if (!criteria || criteria.length === 0) {
      setOverallScore(0);
      return;
    }

    const validCriteria = criteria.filter((c) => c && typeof c.score === 'number');
    if (validCriteria.length === 0) {
      setOverallScore(0);
      return;
    }

    const total = validCriteria.reduce((sum, c) => sum + c.score, 0);
    const average = total / validCriteria.length;
    setOverallScore(Math.round(average * 100) / 100);
  };

  const handleCriteriaChange = () => {
    const criteria = form.getFieldValue('criteria');
    calculateOverallScore(criteria);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        employee_id: values.employee_id,
        evaluator_id: values.evaluator_id,
        evaluation_period: {
          start: values.evaluation_period[0].toISOString(),
          end: values.evaluation_period[1].toISOString(),
        },
        criteria: values.criteria,
        overall_comments: values.overall_comments || '',
        goals: values.goals || [],
        development_plan: values.development_plan || '',
      };

      const url = evaluation
        ? `/api/performance/${evaluation.evaluation_id}`
        : '/api/performance';
      const method = evaluation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save evaluation');
      }

      message.success(
        evaluation
          ? 'Performance evaluation updated successfully'
          : 'Performance evaluation created successfully'
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving evaluation:', error);
      message.error(error.message || 'Failed to save evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        criteria: defaultCriteria.map((c) => ({ ...c, score: 3, comments: '' })),
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="employee_id"
            label="Employee ID"
            rules={[{ required: true, message: 'Please enter employee ID' }]}
          >
            <Input placeholder="Employee ID" disabled={!!evaluation || !!employeeId} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="evaluator_id"
            label="Evaluator ID"
            rules={[{ required: true, message: 'Please enter evaluator ID' }]}
          >
            <Input placeholder="Evaluator ID" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="evaluation_period"
        label="Evaluation Period"
        rules={[{ required: true, message: 'Please select evaluation period' }]}
      >
        <RangePicker style={{ width: '100%' }} />
      </Form.Item>

      <Divider>Performance Criteria</Divider>

      <Card style={{ marginBottom: 16, backgroundColor: '#f0f2f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#666' }}>Overall Score</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
            {overallScore.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>out of 5.00</div>
        </div>
      </Card>

      <Form.List name="criteria">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Card
                key={field.key}
                size="small"
                style={{ marginBottom: 16 }}
                title={`Criterion ${index + 1}`}
                extra={
                  fields.length > 1 ? (
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(field.name);
                        handleCriteriaChange();
                      }}
                    />
                  ) : null
                }
              >
                <Form.Item
                  {...field}
                  name={[field.name, 'name']}
                  label="Criterion Name"
                  rules={[{ required: true, message: 'Please enter criterion name' }]}
                >
                  <Input placeholder="e.g., Quality of Work" />
                </Form.Item>

                <Form.Item
                  {...field}
                  name={[field.name, 'description']}
                  label="Description"
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Describe what this criterion evaluates"
                  />
                </Form.Item>

                <Form.Item
                  {...field}
                  name={[field.name, 'score']}
                  label="Score (1-5)"
                  rules={[
                    { required: true, message: 'Please enter score' },
                    {
                      type: 'number',
                      min: 1,
                      max: 5,
                      message: 'Score must be between 1 and 5',
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={5}
                    step={0.5}
                    style={{ width: '100%' }}
                    onChange={handleCriteriaChange}
                  />
                </Form.Item>

                <Form.Item {...field} name={[field.name, 'comments']} label="Comments">
                  <TextArea rows={2} placeholder="Additional comments for this criterion" />
                </Form.Item>
              </Card>
            ))}
            <Button
              type="dashed"
              onClick={() => {
                add({ name: '', description: '', score: 3, comments: '' });
              }}
              block
              icon={<PlusOutlined />}
            >
              Add Criterion
            </Button>
          </>
        )}
      </Form.List>

      <Divider>Goals</Divider>

      <Form.List name="goals">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Form.Item
                  {...field}
                  name={[field.name, 'description']}
                  rules={[{ required: true, message: 'Please enter goal description' }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input placeholder="Goal description" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  {...field}
                  name={[field.name, 'achieved']}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Switch checkedChildren="Achieved" unCheckedChildren="Not Achieved" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => add({ description: '', achieved: false })}
              block
              icon={<PlusOutlined />}
            >
              Add Goal
            </Button>
          </>
        )}
      </Form.List>

      <Divider>Additional Information</Divider>

      <Form.Item name="overall_comments" label="Overall Comments">
        <TextArea rows={4} placeholder="Overall evaluation comments" />
      </Form.Item>

      <Form.Item name="development_plan" label="Development Plan">
        <TextArea rows={4} placeholder="Recommendations for employee development" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {evaluation ? 'Update Evaluation' : 'Create Evaluation'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}
