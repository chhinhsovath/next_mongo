'use client';

import { useEffect, useState } from 'react';
import { Card, Spin, Empty, message } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import dayjs from 'dayjs';
import type { PerformanceEvaluation } from '@/types/performance';

interface PerformanceChartProps {
  employeeId: string;
  type?: 'trend' | 'radar';
  evaluation?: PerformanceEvaluation;
}

export default function PerformanceChart({
  employeeId,
  type = 'trend',
  evaluation,
}: PerformanceChartProps) {
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    if (type === 'trend') {
      fetchTrendData();
    }
  }, [employeeId, type]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/performance/trend/${employeeId}?limit=6`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch trend data');
      }

      const formattedData = data.data.map((item: any) => ({
        period: dayjs(item.evaluation_period.start).format('MMM YYYY'),
        score: item.overall_score,
      }));

      setTrendData(formattedData);
    } catch (error: any) {
      console.error('Error fetching trend data:', error);
      message.error('Failed to load performance trend');
    } finally {
      setLoading(false);
    }
  };

  if (type === 'trend') {
    return (
      <Card title="Performance Trend" bordered={false}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : trendData.length === 0 ? (
          <Empty description="No performance data available" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#1890ff"
                strokeWidth={2}
                name="Overall Score"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    );
  }

  if (type === 'radar' && evaluation) {
    const radarData = evaluation.criteria.map((criterion) => ({
      criterion: criterion.name,
      score: criterion.score,
      fullMark: 5,
    }));

    return (
      <Card title="Performance Breakdown" bordered={false}>
        {radarData.length === 0 ? (
          <Empty description="No criteria data available" />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="criterion" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#1890ff"
                fill="#1890ff"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </Card>
    );
  }

  return null;
}
