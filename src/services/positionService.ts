import Position, { IPosition } from '@/models/Position';
import Employee from '@/models/Employee';
import Department from '@/models/Department';
import { connectDB } from '@/lib/mongodb';
import cache from '@/lib/cache';
import { nanoid } from 'nanoid';

export interface CreatePositionInput {
  position_code: string;
  position_name: string;
  position_name_khmer?: string;
  department_id: string;
  position_level?: number;
}

export interface UpdatePositionInput {
  position_code?: string;
  position_name?: string;
  position_name_khmer?: string;
  department_id?: string;
  position_level?: number;
  position_status?: 'active' | 'inactive';
}

export interface PositionWithDetails extends IPosition {
  department_name?: string;
  employee_count?: number;
}

/**
 * Create a new position
 */
export async function createPosition(input: CreatePositionInput): Promise<IPosition> {
  await connectDB();

  // Check for duplicate position code
  const existingPosition = await Position.findOne({
    position_code: input.position_code,
  });

  if (existingPosition) {
    throw new Error('Position code already exists');
  }

  // Validate department exists
  const department = await Department.findOne({
    department_id: input.department_id,
    department_status: 'active',
  });

  if (!department) {
    throw new Error('Department not found or inactive');
  }

  const position = await Position.create({
    position_id: `POS-${nanoid(10)}`,
    ...input,
    position_status: 'active',
  });

  // Invalidate cache
  cache.delete('positions:all:false');
  cache.delete('positions:all:true');

  return position.toObject();
}

/**
 * Update a position
 */
export async function updatePosition(
  position_id: string,
  input: UpdatePositionInput
): Promise<IPosition> {
  await connectDB();

  const position = await Position.findOne({ position_id });

  if (!position) {
    throw new Error('Position not found');
  }

  // Check for duplicate position code if updating
  if (input.position_code && input.position_code !== position.position_code) {
    const existingPosition = await Position.findOne({
      position_code: input.position_code,
    });

    if (existingPosition) {
      throw new Error('Position code already exists');
    }
  }

  // Validate department exists if updating
  if (input.department_id && input.department_id !== position.department_id) {
    const department = await Department.findOne({
      department_id: input.department_id,
      department_status: 'active',
    });

    if (!department) {
      throw new Error('Department not found or inactive');
    }
  }

  Object.assign(position, input);
  await position.save();

  // Invalidate cache
  cache.delete('positions:all:false');
  cache.delete('positions:all:true');

  return position.toObject();
}

/**
 * Delete a position (soft delete by setting status to inactive)
 */
export async function deletePosition(position_id: string): Promise<void> {
  await connectDB();

  const position = await Position.findOne({ position_id });

  if (!position) {
    throw new Error('Position not found');
  }

  // Check if position has employees
  const employeeCount = await Employee.countDocuments({
    position_id,
    employee_status: 'active',
  });

  if (employeeCount > 0) {
    throw new Error('Cannot delete position with active employees');
  }

  position.position_status = 'inactive';
  await position.save();

  // Invalidate cache
  cache.delete('positions:all:false');
  cache.delete('positions:all:true');
}

/**
 * Get position by ID
 */
export async function getPositionById(position_id: string): Promise<IPosition | null> {
  await connectDB();

  const position = await Position.findOne({ position_id }).lean();
  return position;
}

/**
 * Get all positions with caching
 */
export async function getAllPositions(includeInactive = false): Promise<IPosition[]> {
  await connectDB();

  // Check cache first
  const cacheKey = `positions:all:${includeInactive}`;
  const cached = cache.get<IPosition[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const filter: any = {};
  if (!includeInactive) {
    filter.position_status = 'active';
  }

  const positions = await Position.find(filter)
    .select('position_id position_code position_name position_name_khmer department_id position_level position_status')
    .sort({ position_name: 1 })
    .lean();

  // Cache for 5 minutes
  cache.set(cacheKey, positions, 5 * 60 * 1000);

  return positions;
}

/**
 * Get positions by department
 */
export async function getPositionsByDepartment(
  department_id: string
): Promise<PositionWithDetails[]> {
  await connectDB();

  const positions = await Position.find({
    department_id,
    position_status: 'active',
  })
    .sort({ position_level: 1, position_name: 1 })
    .lean();

  // Get employee counts for each position
  const employeeCounts = await Employee.aggregate([
    {
      $match: {
        department_id,
        employee_status: 'active',
      },
    },
    {
      $group: {
        _id: '$position_id',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(employeeCounts.map((item) => [item._id, item.count]));

  // Get department name
  const department = await Department.findOne({ department_id }).lean();

  const positionsWithDetails: PositionWithDetails[] = positions.map((pos) => ({
    ...pos,
    department_name: department?.department_name,
    employee_count: countMap.get(pos.position_id) || 0,
  }));

  return positionsWithDetails;
}

/**
 * Get positions with details (department name and employee count)
 */
export async function getPositionsWithDetails(): Promise<PositionWithDetails[]> {
  await connectDB();

  const positions = await Position.find({
    position_status: 'active',
  })
    .sort({ position_name: 1 })
    .lean();

  // Get department names
  const departmentIds = [...new Set(positions.map((p) => p.department_id))];
  const departments = await Department.find({
    department_id: { $in: departmentIds },
  }).lean();

  const deptMap = new Map(departments.map((d) => [d.department_id, d.department_name]));

  // Get employee counts for each position
  const employeeCounts = await Employee.aggregate([
    {
      $match: {
        employee_status: 'active',
      },
    },
    {
      $group: {
        _id: '$position_id',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(employeeCounts.map((item) => [item._id, item.count]));

  const positionsWithDetails: PositionWithDetails[] = positions.map((pos) => ({
    ...pos,
    department_name: deptMap.get(pos.department_id),
    employee_count: countMap.get(pos.position_id) || 0,
  }));

  return positionsWithDetails;
}
