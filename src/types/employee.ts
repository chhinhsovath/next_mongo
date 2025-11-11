import { EmployeeType, EmployeeStatus, Gender } from './index';

export interface Employee {
  _id: string;
  employee_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  first_name_khmer?: string;
  last_name_khmer?: string;
  email: string;
  phone_number: string;
  date_of_birth: Date;
  gender: Gender;
  national_id: string;
  address: string;
  department_id: string;
  position_id: string;
  employee_type: EmployeeType;
  employee_status: EmployeeStatus;
  hire_date: Date;
  termination_date?: Date;
  salary_amount: number;
  profile_photo_url?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateEmployeeInput {
  employee_code: string;
  first_name: string;
  last_name: string;
  first_name_khmer?: string;
  last_name_khmer?: string;
  email: string;
  phone_number: string;
  date_of_birth: Date;
  gender: Gender;
  national_id: string;
  address: string;
  department_id: string;
  position_id: string;
  employee_type: EmployeeType;
  hire_date: Date;
  salary_amount: number;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  employee_status?: EmployeeStatus;
  termination_date?: Date;
  profile_photo_url?: string;
}
