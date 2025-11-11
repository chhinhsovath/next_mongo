import Department, { IDepartment } from '@/models/Department';
import Employee from '@/models/Employee';
import Position from '@/models/Position';
import { connectDB } from '@/lib/mongodb';
import cache from '@/lib/cache';
import { nanoid } from 'nanoid';

export interface CreateDepartmentInput {
  department_code: string;
  department_name: string;
  department_name_khmer?: string;
  manager_id?: string;
  parent_department_id?: string;
}

export interface UpdateDepartmentInput {
  department_code?: string;
  department_name?: string;
  department_name_khmer?: string;
  manager_id?: string;
  parent_department_id?: string;
  department_status?: 'active' | 'inactive';
}

export interface DepartmentHierarchy extends IDepartment {
  children?: DepartmentHierarchy[];
  employee_count?: number;
  manager_name?: string;
}

/**
 * Create a new department
 */
export async function createDepartment(input: CreateDepartmentInput): Promise<IDepartment> {
  await connectDB();

  // Check for duplicate department code
  const existingDept = await Department.findOne({
    department_code: input.department_code,
  });

  if (existingDept) {
    throw new Error('Department code already exists');
  }

  // Validate parent department exists if provided
  if (input.parent_department_id) {
    const parentDept = await Department.findOne({
      department_id: input.parent_department_id,
    });

    if (!parentDept) {
      throw new Error('Parent department not found');
    }
  }

  // Validate manager exists if provided
  if (input.manager_id) {
    const manager = await Employee.findOne({
      employee_id: input.manager_id,
      employee_status: 'active',
    });

    if (!manager) {
      throw new Error('Manager not found or inactive');
    }
  }

  const department = await Department.create({
    department_id: `DEPT-${nanoid(10)}`,
    ...input,
    department_status: 'active',
  });

  // Invalidate cache
  cache.delete('departments:all:false');
  cache.delete('departments:all:true');

  return department.toObject();
}

/**
 * Update a department
 */
export async function updateDepartment(
  department_id: string,
  input: UpdateDepartmentInput
): Promise<IDepartment> {
  await connectDB();

  const department = await Department.findOne({ department_id });

  if (!department) {
    throw new Error('Department not found');
  }

  // Check for duplicate department code if updating
  if (input.department_code && input.department_code !== department.department_code) {
    const existingDept = await Department.findOne({
      department_code: input.department_code,
    });

    if (existingDept) {
      throw new Error('Department code already exists');
    }
  }

  // Validate parent department exists if provided
  if (input.parent_department_id) {
    // Prevent circular reference
    if (input.parent_department_id === department_id) {
      throw new Error('Department cannot be its own parent');
    }

    const parentDept = await Department.findOne({
      department_id: input.parent_department_id,
    });

    if (!parentDept) {
      throw new Error('Parent department not found');
    }

    // Check if the new parent is a descendant (would create circular reference)
    const isDescendant = await isDescendantOf(input.parent_department_id, department_id);
    if (isDescendant) {
      throw new Error('Cannot set a descendant department as parent');
    }
  }

  // Validate manager exists if provided
  if (input.manager_id) {
    const manager = await Employee.findOne({
      employee_id: input.manager_id,
      employee_status: 'active',
    });

    if (!manager) {
      throw new Error('Manager not found or inactive');
    }
  }

  Object.assign(department, input);
  await department.save();

  // Invalidate cache
  cache.delete('departments:all:false');
  cache.delete('departments:all:true');

  return department.toObject();
}

/**
 * Delete a department (soft delete by setting status to inactive)
 */
export async function deleteDepartment(department_id: string): Promise<void> {
  await connectDB();

  const department = await Department.findOne({ department_id });

  if (!department) {
    throw new Error('Department not found');
  }

  // Check if department has employees
  const employeeCount = await Employee.countDocuments({
    department_id,
    employee_status: 'active',
  });

  if (employeeCount > 0) {
    throw new Error('Cannot delete department with active employees');
  }

  // Check if department has positions
  const positionCount = await Position.countDocuments({
    department_id,
    position_status: 'active',
  });

  if (positionCount > 0) {
    throw new Error('Cannot delete department with active positions');
  }

  // Check if department has child departments
  const childCount = await Department.countDocuments({
    parent_department_id: department_id,
    department_status: 'active',
  });

  if (childCount > 0) {
    throw new Error('Cannot delete department with child departments');
  }

  department.department_status = 'inactive';
  await department.save();

  // Invalidate cache
  cache.delete('departments:all:false');
  cache.delete('departments:all:true');
}

/**
 * Get department by ID
 */
export async function getDepartmentById(department_id: string): Promise<IDepartment | null> {
  await connectDB();

  const department = await Department.findOne({ department_id }).lean();
  return department;
}

/**
 * Get all departments with caching
 */
export async function getAllDepartments(includeInactive = false): Promise<IDepartment[]> {
  await connectDB();

  // Check cache first
  const cacheKey = `departments:all:${includeInactive}`;
  const cached = cache.get<IDepartment[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const filter: any = {};
  if (!includeInactive) {
    filter.department_status = 'active';
  }

  const departments = await Department.find(filter)
    .select('department_id department_code department_name department_name_khmer manager_id parent_department_id department_status')
    .sort({ department_name: 1 })
    .lean();

  // Cache for 5 minutes
  cache.set(cacheKey, departments, 5 * 60 * 1000);

  return departments;
}

/**
 * Get department hierarchy as a tree structure
 */
export async function getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
  await connectDB();

  const departments = await Department.find({
    department_status: 'active',
  }).lean();

  // Get employee counts for each department
  const employeeCounts = await Employee.aggregate([
    {
      $match: {
        employee_status: 'active',
      },
    },
    {
      $group: {
        _id: '$department_id',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(employeeCounts.map((item) => [item._id, item.count]));

  // Get manager names
  const managerIds = departments
    .filter((d) => d.manager_id)
    .map((d) => d.manager_id as string);

  const managers = await Employee.find({
    employee_id: { $in: managerIds },
  })
    .select('employee_id first_name last_name')
    .lean();

  const managerMap = new Map(
    managers.map((m) => [m.employee_id, `${m.first_name} ${m.last_name}`])
  );

  // Build hierarchy
  const departmentMap = new Map<string, DepartmentHierarchy>();
  const rootDepartments: DepartmentHierarchy[] = [];

  // First pass: create all department objects
  departments.forEach((dept) => {
    const deptWithExtras: DepartmentHierarchy = {
      ...dept,
      children: [],
      employee_count: countMap.get(dept.department_id) || 0,
      manager_name: dept.manager_id ? managerMap.get(dept.manager_id) : undefined,
    };
    departmentMap.set(dept.department_id, deptWithExtras);
  });

  // Second pass: build tree structure
  departments.forEach((dept) => {
    const deptNode = departmentMap.get(dept.department_id)!;

    if (dept.parent_department_id) {
      const parent = departmentMap.get(dept.parent_department_id);
      if (parent) {
        parent.children!.push(deptNode);
      } else {
        // Parent not found or inactive, treat as root
        rootDepartments.push(deptNode);
      }
    } else {
      rootDepartments.push(deptNode);
    }
  });

  return rootDepartments;
}

/**
 * Check if a department is a descendant of another department
 */
async function isDescendantOf(
  potentialDescendant: string,
  ancestorId: string
): Promise<boolean> {
  const descendant = await Department.findOne({
    department_id: potentialDescendant,
  });

  if (!descendant || !descendant.parent_department_id) {
    return false;
  }

  if (descendant.parent_department_id === ancestorId) {
    return true;
  }

  return isDescendantOf(descendant.parent_department_id, ancestorId);
}

/**
 * Get departments by parent
 */
export async function getDepartmentsByParent(
  parent_department_id: string | null
): Promise<IDepartment[]> {
  await connectDB();

  const filter: any = {
    department_status: 'active',
  };

  if (parent_department_id === null) {
    filter.parent_department_id = { $exists: false };
  } else {
    filter.parent_department_id = parent_department_id;
  }

  const departments = await Department.find(filter).sort({ department_name: 1 }).lean();
  return departments;
}
