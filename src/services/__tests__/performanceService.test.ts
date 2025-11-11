import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
  calculateOverallScore,
  createPerformanceEvaluation,
  getPerformanceTrend,
} from '../performanceService';
import PerformanceEvaluation from '@/models/PerformanceEvaluation';
import { PerformanceCriterion } from '@/types/performance';

// Mock the connectDB function to use in-memory database
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(mongoose),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Performance Service - Overall Score Calculation', () => {
  test('should calculate overall score correctly with multiple criteria', () => {
    const criteria: PerformanceCriterion[] = [
      { name: 'Quality', description: 'Work quality', score: 4, comments: 'Good' },
      { name: 'Productivity', description: 'Output', score: 5, comments: 'Excellent' },
      { name: 'Teamwork', description: 'Collaboration', score: 3, comments: 'Average' },
    ];

    const overallScore = calculateOverallScore(criteria);

    // (4 + 5 + 3) / 3 = 4
    expect(overallScore).toBe(4);
  });

  test('should round overall score to 2 decimal places', () => {
    const criteria: PerformanceCriterion[] = [
      { name: 'Quality', description: 'Work quality', score: 4, comments: 'Good' },
      { name: 'Productivity', description: 'Output', score: 5, comments: 'Excellent' },
      { name: 'Teamwork', description: 'Collaboration', score: 4, comments: 'Good' },
    ];

    const overallScore = calculateOverallScore(criteria);

    // (4 + 5 + 4) / 3 = 4.333... should round to 4.33
    expect(overallScore).toBe(4.33);
  });

  test('should return 0 for empty criteria array', () => {
    const criteria: PerformanceCriterion[] = [];

    const overallScore = calculateOverallScore(criteria);

    expect(overallScore).toBe(0);
  });

  test('should handle single criterion', () => {
    const criteria: PerformanceCriterion[] = [
      { name: 'Quality', description: 'Work quality', score: 3.5, comments: 'Good' },
    ];

    const overallScore = calculateOverallScore(criteria);

    expect(overallScore).toBe(3.5);
  });

  test('should calculate correctly with decimal scores', () => {
    const criteria: PerformanceCriterion[] = [
      { name: 'Quality', description: 'Work quality', score: 4.5, comments: 'Good' },
      { name: 'Productivity', description: 'Output', score: 3.7, comments: 'Average' },
    ];

    const overallScore = calculateOverallScore(criteria);

    // (4.5 + 3.7) / 2 = 4.1
    expect(overallScore).toBe(4.1);
  });
});

describe('Performance Service - Performance Trend Analysis', () => {
  test('should return performance trend in chronological order', async () => {
    const employeeId = 'EMP-001';

    // Create multiple evaluations with different dates
    await PerformanceEvaluation.create({
      evaluation_id: 'EVAL-001',
      employee_id: employeeId,
      evaluator_id: 'MGR-001',
      evaluation_period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-31'),
      },
      criteria: [
        { name: 'Quality', description: 'Work quality', score: 3, comments: 'Good' },
      ],
      overall_score: 3,
      overall_comments: 'Q1 evaluation',
      goals: [],
      development_plan: '',
      evaluation_status: 'completed',
    });

    await PerformanceEvaluation.create({
      evaluation_id: 'EVAL-002',
      employee_id: employeeId,
      evaluator_id: 'MGR-001',
      evaluation_period: {
        start: new Date('2024-04-01'),
        end: new Date('2024-06-30'),
      },
      criteria: [
        { name: 'Quality', description: 'Work quality', score: 4, comments: 'Better' },
      ],
      overall_score: 4,
      overall_comments: 'Q2 evaluation',
      goals: [],
      development_plan: '',
      evaluation_status: 'completed',
    });

    await PerformanceEvaluation.create({
      evaluation_id: 'EVAL-003',
      employee_id: employeeId,
      evaluator_id: 'MGR-001',
      evaluation_period: {
        start: new Date('2024-07-01'),
        end: new Date('2024-09-30'),
      },
      criteria: [
        { name: 'Quality', description: 'Work quality', score: 5, comments: 'Excellent' },
      ],
      overall_score: 5,
      overall_comments: 'Q3 evaluation',
      goals: [],
      development_plan: '',
      evaluation_status: 'acknowledged',
    });

    const trend = await getPerformanceTrend(employeeId);

    expect(trend).toHaveLength(3);
    // Should be in chronological order (oldest first)
    expect(trend[0].overall_score).toBe(3);
    expect(trend[1].overall_score).toBe(4);
    expect(trend[2].overall_score).toBe(5);
  });

  test('should only include completed or acknowledged evaluations', async () => {
    const employeeId = 'EMP-002';

    await PerformanceEvaluation.create({
      evaluation_id: 'EVAL-004',
      employee_id: employeeId,
      evaluator_id: 'MGR-001',
      evaluation_period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-31'),
      },
      criteria: [{ name: 'Quality', description: 'Work quality', score: 3, comments: 'Good' }],
      overall_score: 3,
      overall_comments: 'Completed',
      goals: [],
      development_plan: '',
      evaluation_status: 'completed',
    });

    await PerformanceEvaluation.create({
      evaluation_id: 'EVAL-005',
      employee_id: employeeId,
      evaluator_id: 'MGR-001',
      evaluation_period: {
        start: new Date('2024-04-01'),
        end: new Date('2024-06-30'),
      },
      criteria: [{ name: 'Quality', description: 'Work quality', score: 4, comments: 'Better' }],
      overall_score: 4,
      overall_comments: 'Draft - should not appear',
      goals: [],
      development_plan: '',
      evaluation_status: 'draft',
    });

    const trend = await getPerformanceTrend(employeeId);

    expect(trend).toHaveLength(1);
    expect(trend[0].overall_score).toBe(3);
  });

  test('should limit results to specified number', async () => {
    const employeeId = 'EMP-003';

    // Create 7 evaluations with scores between 1-5
    const scores = [3, 3.5, 4, 4.5, 5, 4, 3.5];
    for (let i = 0; i < 7; i++) {
      await PerformanceEvaluation.create({
        evaluation_id: `EVAL-${100 + i}`,
        employee_id: employeeId,
        evaluator_id: 'MGR-001',
        evaluation_period: {
          start: new Date(`2024-${String(i + 1).padStart(2, '0')}-01`),
          end: new Date(`2024-${String(i + 1).padStart(2, '0')}-28`),
        },
        criteria: [{ name: 'Quality', description: 'Work quality', score: scores[i], comments: 'Test' }],
        overall_score: scores[i],
        overall_comments: `Evaluation ${i}`,
        goals: [],
        development_plan: '',
        evaluation_status: 'completed',
      });
    }

    const trend = await getPerformanceTrend(employeeId, 3);

    expect(trend).toHaveLength(3);
    // Should return the 3 most recent evaluations in chronological order
    expect(trend[0].overall_score).toBe(5); // 5th evaluation
    expect(trend[1].overall_score).toBe(4); // 6th evaluation
    expect(trend[2].overall_score).toBe(3.5); // 7th evaluation
  });

  test('should return empty array for employee with no evaluations', async () => {
    const trend = await getPerformanceTrend('EMP-NONEXISTENT');

    expect(trend).toHaveLength(0);
  });

  test('should only return evaluations for specified employee', async () => {
    await PerformanceEvaluation.create({
      evaluation_id: 'EVAL-200',
      employee_id: 'EMP-004',
      evaluator_id: 'MGR-001',
      evaluation_period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-31'),
      },
      criteria: [{ name: 'Quality', description: 'Work quality', score: 3, comments: 'Good' }],
      overall_score: 3,
      overall_comments: 'Employee 4',
      goals: [],
      development_plan: '',
      evaluation_status: 'completed',
    });

    await PerformanceEvaluation.create({
      evaluation_id: 'EVAL-201',
      employee_id: 'EMP-005',
      evaluator_id: 'MGR-001',
      evaluation_period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-31'),
      },
      criteria: [{ name: 'Quality', description: 'Work quality', score: 5, comments: 'Excellent' }],
      overall_score: 5,
      overall_comments: 'Employee 5',
      goals: [],
      development_plan: '',
      evaluation_status: 'completed',
    });

    const trendEmp4 = await getPerformanceTrend('EMP-004');
    const trendEmp5 = await getPerformanceTrend('EMP-005');

    expect(trendEmp4).toHaveLength(1);
    expect(trendEmp4[0].overall_score).toBe(3);
    
    expect(trendEmp5).toHaveLength(1);
    expect(trendEmp5[0].overall_score).toBe(5);
  });
});
