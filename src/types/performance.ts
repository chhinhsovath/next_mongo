export interface PerformanceEvaluation {
  _id: string;
  evaluation_id: string;
  employee_id: string;
  evaluator_id: string;
  evaluation_period: {
    start: Date;
    end: Date;
  };
  criteria: PerformanceCriterion[];
  overall_score: number;
  overall_comments: string;
  goals: PerformanceGoal[];
  development_plan: string;
  evaluation_status: 'draft' | 'completed' | 'acknowledged';
  acknowledged_by?: string;
  acknowledged_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PerformanceCriterion {
  name: string;
  description: string;
  score: number;
  comments: string;
}

export interface PerformanceGoal {
  description: string;
  achieved: boolean;
}

export interface CreatePerformanceEvaluationRequest {
  employee_id: string;
  evaluator_id: string;
  evaluation_period: {
    start: Date | string;
    end: Date | string;
  };
  criteria: PerformanceCriterion[];
  overall_comments?: string;
  goals?: PerformanceGoal[];
  development_plan?: string;
}

export interface UpdatePerformanceEvaluationRequest {
  evaluation_period?: {
    start: Date | string;
    end: Date | string;
  };
  criteria?: PerformanceCriterion[];
  overall_comments?: string;
  goals?: PerformanceGoal[];
  development_plan?: string;
  evaluation_status?: 'draft' | 'completed' | 'acknowledged';
}

export interface AcknowledgeEvaluationRequest {
  acknowledged_by: string;
}
