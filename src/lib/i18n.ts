// Bilingual support configuration for English and Khmer

export type Language = 'en' | 'km';

export const DEFAULT_LANGUAGE: Language = 'en';

// Common translations
export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    employees: 'Employees',
    leave: 'Leave',
    attendance: 'Attendance',
    payroll: 'Payroll',
    performance: 'Performance',
    organization: 'Organization',
    reports: 'Reports',
    departments: 'Departments',
    positions: 'Positions',
    
    // Common actions
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    approve: 'Approve',
    reject: 'Reject',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
    
    // Common labels
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    
    // Messages
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    noData: 'No data available',
  },
  km: {
    // Navigation
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    employees: 'បុគ្គលិក',
    leave: 'ច្បាប់',
    attendance: 'វត្តមាន',
    payroll: 'បើកប្រាក់ខែ',
    performance: 'ការអនុវត្ត',
    organization: 'អង្គភាព',
    reports: 'របាយការណ៍',
    departments: 'នាយកដ្ឋាន',
    positions: 'មុខតំណែង',
    
    // Common actions
    add: 'បន្ថែម',
    edit: 'កែសម្រួល',
    delete: 'លុប',
    save: 'រក្សាទុក',
    cancel: 'បោះបង់',
    submit: 'ដាក់ស្នើ',
    approve: 'អនុម័ត',
    reject: 'បដិសេធ',
    search: 'ស្វែងរក',
    filter: 'តម្រង',
    export: 'នាំចេញ',
    print: 'បោះពុម្ព',
    
    // Common labels
    name: 'ឈ្មោះ',
    email: 'អ៊ីមែល',
    phone: 'ទូរស័ព្ទ',
    address: 'អាសយដ្ឋាន',
    status: 'ស្ថានភាព',
    date: 'កាលបរិច្ឆេទ',
    actions: 'សកម្មភាព',
    
    // Status
    active: 'សកម្ម',
    inactive: 'អសកម្ម',
    pending: 'កំពុងរង់ចាំ',
    approved: 'បានអនុម័ត',
    rejected: 'បានបដិសេធ',
    
    // Messages
    success: 'ជោគជ័យ',
    error: 'កំហុស',
    loading: 'កំពុងផ្ទុក...',
    noData: 'មិនមានទិន្នន័យ',
  },
};

export function getTranslation(key: string, language: Language = DEFAULT_LANGUAGE): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

export function t(key: string, language?: Language): string {
  return getTranslation(key, language);
}
