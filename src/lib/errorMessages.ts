/**
 * Bilingual error messages (English and Khmer)
 */

export type Language = 'en' | 'km';

export interface ErrorMessage {
  en: string;
  km: string;
}

export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Authentication errors
  AUTH_REQUIRED: {
    en: 'Authentication required',
    km: 'ត្រូវការការផ្ទៀងផ្ទាត់',
  },
  INVALID_CREDENTIALS: {
    en: 'Invalid username or password',
    km: 'ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ',
  },
  SESSION_EXPIRED: {
    en: 'Your session has expired. Please log in again.',
    km: 'សម័យរបស់អ្នកបានផុតកំណត់។ សូមចូលម្តងទៀត។',
  },
  FORBIDDEN: {
    en: 'You do not have permission to perform this action',
    km: 'អ្នកមិនមានសិទ្ធិធ្វើសកម្មភាពនេះទេ',
  },

  // Validation errors
  VALIDATION_ERROR: {
    en: 'Validation failed. Please check your input.',
    km: 'ការផ្ទៀងផ្ទាត់បានបរាជ័យ។ សូមពិនិត្យការបញ្ចូលរបស់អ្នក។',
  },
  REQUIRED_FIELD: {
    en: 'This field is required',
    km: 'វាលនេះត្រូវបានទាមទារ',
  },
  INVALID_EMAIL: {
    en: 'Invalid email address',
    km: 'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ',
  },
  INVALID_DATE: {
    en: 'Invalid date format',
    km: 'ទម្រង់កាលបរិច្ឆេទមិនត្រឹមត្រូវ',
  },
  INVALID_DATE_RANGE: {
    en: 'End date must be after start date',
    km: 'កាលបរិច្ឆេទបញ្ចប់ត្រូវតែក្រោយកាលបរិច្ឆេទចាប់ផ្តើម',
  },
  INVALID_PHONE: {
    en: 'Invalid phone number format',
    km: 'ទម្រង់លេខទូរស័ព្ទមិនត្រឹមត្រូវ',
  },
  INVALID_URL: {
    en: 'Invalid URL format',
    km: 'ទម្រង់ URL មិនត្រឹមត្រូវ',
  },
  INVALID_GPS_COORDINATES: {
    en: 'Invalid GPS coordinates',
    km: 'កូអរដោនេ GPS មិនត្រឹមត្រូវ',
  },

  // Resource errors
  NOT_FOUND: {
    en: 'Resource not found',
    km: 'រកមិនឃើញធនធាន',
  },
  EMPLOYEE_NOT_FOUND: {
    en: 'Employee not found',
    km: 'រកមិនឃើញបុគ្គលិក',
  },
  DEPARTMENT_NOT_FOUND: {
    en: 'Department not found',
    km: 'រកមិនឃើញនាយកដ្ឋាន',
  },
  POSITION_NOT_FOUND: {
    en: 'Position not found',
    km: 'រកមិនឃើញមុខតំណែង',
  },
  LEAVE_REQUEST_NOT_FOUND: {
    en: 'Leave request not found',
    km: 'រកមិនឃើញសំណើច្បាប់',
  },
  ATTENDANCE_NOT_FOUND: {
    en: 'Attendance record not found',
    km: 'រកមិនឃើញកំណត់ត្រាវត្តមាន',
  },
  PAYROLL_NOT_FOUND: {
    en: 'Payroll record not found',
    km: 'រកមិនឃើញកំណត់ត្រាប្រាក់បៀវត្សរ៍',
  },
  EVALUATION_NOT_FOUND: {
    en: 'Performance evaluation not found',
    km: 'រកមិនឃើញការវាយតម្លៃការអនុវត្ត',
  },

  // Conflict errors
  CONFLICT: {
    en: 'Resource already exists',
    km: 'ធនធានមានរួចហើយ',
  },
  DUPLICATE_EMPLOYEE_CODE: {
    en: 'Employee code already exists',
    km: 'លេខកូដបុគ្គលិកមានរួចហើយ',
  },
  DUPLICATE_EMAIL: {
    en: 'Email address already exists',
    km: 'អាសយដ្ឋានអ៊ីមែលមានរួចហើយ',
  },
  DUPLICATE_USERNAME: {
    en: 'Username already exists',
    km: 'ឈ្មោះអ្នកប្រើមានរួចហើយ',
  },
  LEAVE_OVERLAP: {
    en: 'Leave request overlaps with existing approved leave',
    km: 'សំណើច្បាប់ជាប់គ្នាជាមួយច្បាប់ដែលបានអនុម័តរួចហើយ',
  },
  ALREADY_CHECKED_IN: {
    en: 'Already checked in for this date',
    km: 'បានចុះឈ្មោះចូលរួចហើយសម្រាប់កាលបរិច្ឆេទនេះ',
  },
  ALREADY_CHECKED_OUT: {
    en: 'Already checked out for this date',
    km: 'បានចុះឈ្មោះចេញរួចហើយសម្រាប់កាលបរិច្ឆេទនេះ',
  },

  // Business logic errors
  INSUFFICIENT_LEAVE_BALANCE: {
    en: 'Insufficient leave balance',
    km: 'សមតុល្យច្បាប់មិនគ្រប់គ្រាន់',
  },
  CANNOT_APPROVE_OWN_REQUEST: {
    en: 'You cannot approve your own request',
    km: 'អ្នកមិនអាចអនុម័តសំណើរបស់អ្នកផ្ទាល់បានទេ',
  },
  LEAVE_ALREADY_PROCESSED: {
    en: 'Leave request has already been processed',
    km: 'សំណើច្បាប់ត្រូវបានដំណើរការរួចហើយ',
  },
  CANNOT_DELETE_ACTIVE_EMPLOYEE: {
    en: 'Cannot delete an active employee',
    km: 'មិនអាចលុបបុគ្គលិកសកម្មបានទេ',
  },
  CANNOT_DELETE_DEPARTMENT_WITH_EMPLOYEES: {
    en: 'Cannot delete department with active employees',
    km: 'មិនអាចលុបនាយកដ្ឋានដែលមានបុគ្គលិកសកម្មបានទេ',
  },
  PAYROLL_ALREADY_APPROVED: {
    en: 'Payroll has already been approved',
    km: 'ប្រាក់បៀវត្សរ៍ត្រូវបានអនុម័តរួចហើយ',
  },
  EVALUATION_ALREADY_ACKNOWLEDGED: {
    en: 'Evaluation has already been acknowledged',
    km: 'ការវាយតម្លៃត្រូវបានទទួលស្គាល់រួចហើយ',
  },
  INVALID_PAGINATION: {
    en: 'Invalid pagination parameters',
    km: 'ប៉ារ៉ាម៉ែត្រទំព័រមិនត្រឹមត្រូវ',
  },
  INVALID_QUERY_PARAMS: {
    en: 'Invalid query parameters',
    km: 'ប៉ារ៉ាម៉ែត្រសំណួរមិនត្រឹមត្រូវ',
  },
  MISSING_REQUIRED_FIELD: {
    en: 'Missing required field',
    km: 'បាត់វាលដែលត្រូវការ',
  },
  INVALID_FIELD_VALUE: {
    en: 'Invalid field value',
    km: 'តម្លៃវាលមិនត្រឹមត្រូវ',
  },
  FIELD_TOO_LONG: {
    en: 'Field value is too long',
    km: 'តម្លៃវាលវែងពេក',
  },
  FIELD_TOO_SHORT: {
    en: 'Field value is too short',
    km: 'តម្លៃវាលខ្លីពេក',
  },
  INVALID_NUMBER: {
    en: 'Invalid number format',
    km: 'ទម្រង់លេខមិនត្រឹមត្រូវ',
  },
  NUMBER_TOO_SMALL: {
    en: 'Number is too small',
    km: 'លេខតូចពេក',
  },
  NUMBER_TOO_LARGE: {
    en: 'Number is too large',
    km: 'លេខធំពេក',
  },

  // Database errors
  DATABASE_ERROR: {
    en: 'Database operation failed',
    km: 'ប្រតិបត្តិការមូលដ្ឋានទិន្នន័យបានបរាជ័យ',
  },
  CONNECTION_ERROR: {
    en: 'Failed to connect to database',
    km: 'បរាជ័យក្នុងការភ្ជាប់ទៅមូលដ្ឋានទិន្នន័យ',
  },

  // Server errors
  SERVER_ERROR: {
    en: 'Internal server error',
    km: 'កំហុសម៉ាស៊ីនមេខាងក្នុង',
  },
  UNKNOWN_ERROR: {
    en: 'An unknown error occurred',
    km: 'កំហុសមិនស្គាល់បានកើតឡើង',
  },

  // Success messages
  OPERATION_SUCCESS: {
    en: 'Operation completed successfully',
    km: 'ប្រតិបត្តិការបានបញ្ចប់ដោយជោគជ័យ',
  },
  CREATED_SUCCESS: {
    en: 'Created successfully',
    km: 'បង្កើតបានជោគជ័យ',
  },
  UPDATED_SUCCESS: {
    en: 'Updated successfully',
    km: 'ធ្វើបច្ចុប្បន្នភាពបានជោគជ័យ',
  },
  DELETED_SUCCESS: {
    en: 'Deleted successfully',
    km: 'លុបបានជោគជ័យ',
  },
  APPROVED_SUCCESS: {
    en: 'Approved successfully',
    km: 'អនុម័តបានជោគជ័យ',
  },
  REJECTED_SUCCESS: {
    en: 'Rejected successfully',
    km: 'បដិសេធបានជោគជ័យ',
  },
};

/**
 * Get error message in specified language
 * @param key - Error message key
 * @param lang - Language code (en or km)
 * @returns Localized error message
 */
export function getErrorMessage(key: string, lang: Language = 'en'): string {
  const message = ERROR_MESSAGES[key];
  if (!message) {
    return ERROR_MESSAGES.UNKNOWN_ERROR[lang];
  }
  return message[lang];
}

/**
 * Get error message with dynamic values
 * @param key - Error message key
 * @param lang - Language code
 * @param values - Values to replace in message
 * @returns Localized error message with replaced values
 */
export function getErrorMessageWithValues(
  key: string,
  lang: Language = 'en',
  values: Record<string, string> = {}
): string {
  let message = getErrorMessage(key, lang);
  
  Object.entries(values).forEach(([placeholder, value]) => {
    message = message.replace(`{${placeholder}}`, value);
  });
  
  return message;
}
