import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceEvaluation extends Document {
  evaluation_id: string;
  employee_id: string;
  evaluator_id: string;
  evaluation_period: {
    start: Date;
    end: Date;
  };
  criteria: {
    name: string;
    description: string;
    score: number;
    comments: string;
  }[];
  overall_score: number;
  overall_comments: string;
  goals: {
    description: string;
    achieved: boolean;
  }[];
  development_plan: string;
  evaluation_status: 'draft' | 'completed' | 'acknowledged';
  acknowledged_by?: string;
  acknowledged_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const PerformanceEvaluationSchema = new Schema<IPerformanceEvaluation>(
  {
    evaluation_id: {
      type: String,
      required: true,
      unique: true,
    },
    employee_id: {
      type: String,
      required: true,
      index: true,
    },
    evaluator_id: {
      type: String,
      required: true,
    },
    evaluation_period: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    criteria: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comments: {
          type: String,
          default: '',
        },
      },
    ],
    overall_score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overall_comments: {
      type: String,
      default: '',
    },
    goals: [
      {
        description: {
          type: String,
          required: true,
        },
        achieved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    development_plan: {
      type: String,
      default: '',
    },
    evaluation_status: {
      type: String,
      enum: ['draft', 'completed', 'acknowledged'],
      default: 'draft',
    },
    acknowledged_by: {
      type: String,
    },
    acknowledged_at: {
      type: Date,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for querying evaluations by employee and period
PerformanceEvaluationSchema.index({ employee_id: 1, 'evaluation_period.start': -1 });
PerformanceEvaluationSchema.index({ evaluation_status: 1, created_at: -1 });
PerformanceEvaluationSchema.index({ evaluator_id: 1, evaluation_status: 1 });

export default mongoose.models.PerformanceEvaluation ||
  mongoose.model<IPerformanceEvaluation>('PerformanceEvaluation', PerformanceEvaluationSchema);
