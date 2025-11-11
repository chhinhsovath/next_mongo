# Database Seeding Guide

## Overview

This guide explains how to seed the HRMIS database with initial data for development and testing purposes.

## What Gets Seeded

The seeding script (`scripts/seed-database.ts`) populates the database with:

### 1. Departments (5)
All departments include both English and Khmer names:

| Code | English Name | Khmer Name | Manager |
|------|-------------|------------|---------|
| HR | Human Resources | ធនធានមនុស្ស | Admin User |
| IT | Information Technology | បច្ចេកវិទ្យាព័ត៌មាន | Virak Seng |
| FIN | Finance | ហិរញ្ញវត្ថុ | Sophea Mao |
| OPS | Operations | ប្រតិបត្តិការ | - |
| SALES | Sales & Marketing | លក់និងទីផ្សារ | - |

### 2. Positions (14)
Positions across all departments with Khmer translations:

**HR Department:**
- HR Director (នាយកធនធានមនុស្ស)
- HR Manager (អ្នកគ្រប់គ្រងធនធានមនុស្ស)
- HR Specialist (អ្នកឯកទេសធនធានមនុស្ស)

**IT Department:**
- IT Director (នាយកបច្ចេកវិទ្យាព័ត៌មាន)
- Development Lead (ប្រធានក្រុមអភិវឌ្ឍន៍)
- Senior Developer (អ្នកអភិវឌ្ឍន៍ជាន់ខ្ពស់)
- Junior Developer (អ្នកអភិវឌ្ឍន៍កម្រិតដំបូង)

**Finance Department:**
- Finance Director (នាយកហិរញ្ញវត្ថុ)
- Accounting Manager (អ្នកគ្រប់គ្រងគណនេយ្យ)
- Accountant (គណនេយ្យករ)

**Operations Department:**
- Operations Manager (អ្នកគ្រប់គ្រងប្រតិបត្តិការ)
- Operations Coordinator (អ្នកសម្របសម្រួលប្រតិបត្តិការ)

**Sales & Marketing Department:**
- Sales Manager (អ្នកគ្រប់គ្រងលក់)
- Sales Representative (តំណាងលក់)

### 3. Employees (10)
Sample employees with complete information including Khmer names:

| ID | Name | Khmer Name | Department | Position | Role |
|----|------|------------|------------|----------|------|
| EMP001 | Admin User | អ្នកគ្រប់គ្រង ប្រព័ន្ធ | HR | HR Director | Admin |
| EMP002 | Sokha Chan | សុខា ចាន់ | HR | HR Manager | HR Manager |
| EMP003 | Dara Pov | ដារ៉ា ពៅ | HR | HR Specialist | Employee |
| EMP004 | Virak Seng | វីរៈ សេង | IT | IT Director | Manager |
| EMP005 | Sreymom Keo | ស្រីមុំ កែវ | IT | Development Lead | Manager |
| EMP006 | Bopha Lim | បុប្ផា លឹម | IT | Senior Developer | Employee |
| EMP007 | Ratanak Heng | រតនៈ ហេង | IT | Junior Developer | Employee |
| EMP008 | Sophea Mao | សុភា ម៉ៅ | Finance | Finance Director | Manager |
| EMP009 | Piseth Tan | ពិសិដ្ឋ តាន់ | Finance | Accounting Manager | Manager |
| EMP010 | Chenda Sok | ចេន្ដា សុខ | Finance | Accountant | Employee |

### 4. User Accounts (10)
One user account for each employee with role-based access:

| Username | Role | Employee |
|----------|------|----------|
| admin | admin | Admin User |
| sokha.chan | hr_manager | Sokha Chan |
| dara.pov | employee | Dara Pov |
| virak.seng | manager | Virak Seng |
| sreymom.keo | manager | Sreymom Keo |
| bopha.lim | employee | Bopha Lim |
| ratanak.heng | employee | Ratanak Heng |
| sophea.mao | manager | Sophea Mao |
| piseth.tan | manager | Piseth Tan |
| chenda.sok | employee | Chenda Sok |

**Default Password:** All users have the password `Admin@123`

### 5. Leave Types (7)
Leave types with annual quotas and Khmer names:

| Type | Khmer Name | Annual Quota | Paid |
|------|------------|--------------|------|
| Annual Leave | ច្បាប់ប្រចាំឆ្នាំ | 18 days | Yes |
| Sick Leave | ច្បាប់ឈឺ | 15 days | Yes |
| Personal Leave | ច្បាប់ផ្ទាល់ខ្លួន | 7 days | Yes |
| Maternity Leave | ច្បាប់សម្រាល | 90 days | Yes |
| Paternity Leave | ច្បាប់បិតា | 7 days | Yes |
| Unpaid Leave | ច្បាប់គ្មានប្រាក់ខែ | 30 days | No |
| Compassionate Leave | ច្បាប់កង្វល់ | 5 days | Yes |

### 6. Leave Balances (70)
Initial leave balances for all employees (10 employees × 7 leave types):
- All balances set to full annual quota
- Used days: 0
- Remaining days: Full quota
- Year: Current year

## Prerequisites

Before running the seed script:

1. **MongoDB Connection**: Ensure you have access to MongoDB Atlas or a local MongoDB instance
2. **Environment Variables**: Set up `.env.local` with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=sangapac_hrmis
   ```
3. **IP Whitelisting**: If using MongoDB Atlas, add your IP address to the whitelist
4. **Dependencies**: Run `npm install` to install all required packages

## Running the Seed Script

### Command

```bash
npm run seed
```

### What Happens

1. **Connection**: Connects to MongoDB using environment variables
2. **Clearing**: Deletes all existing data from collections (⚠️ Warning!)
3. **Seeding**: Inserts data in the correct order:
   - Departments → Positions → Employees → Users → Leave Types → Leave Balances
4. **Relationships**: Updates department managers
5. **Summary**: Displays count of seeded records

### Expected Output

```
🌱 Starting database seeding...

Database: sangapac_hrmis
✅ Connected to MongoDB

🗑️  Clearing existing data...
✅ Collections cleared

📁 Seeding departments...
✅ Seeded 5 departments

💼 Seeding positions...
✅ Seeded 14 positions

👥 Seeding employees...
✅ Seeded 10 employees

🔐 Seeding users...
✅ Seeded 10 users
ℹ️  Default password for all users: Admin@123

🏖️  Seeding leave types...
✅ Seeded 7 leave types

💰 Seeding leave balances...
✅ Seeded 70 leave balances

👔 Updating department managers...
✅ Department managers updated

✅ Database seeding completed successfully!

📊 Summary:
   - Departments: 5
   - Positions: 14
   - Employees: 10
   - Users: 10
   - Leave Types: 7
   - Leave Balances: 70

🔑 Login Credentials:
   Username: admin
   Password: Admin@123

   All users have the same default password: Admin@123

✅ Database connection closed
```

## Testing the Seeded Data

After seeding, you can test the system:

### 1. Login as Admin
```
Username: admin
Password: Admin@123
```

### 2. Verify Data
- Navigate to Employees page to see all 10 employees
- Check Departments page for 5 departments
- View Positions page for 14 positions
- Check Leave Types for 7 types

### 3. Test Different Roles
Login with different user accounts to test role-based access:

**HR Manager:**
```
Username: sokha.chan
Password: Admin@123
```

**Department Manager:**
```
Username: virak.seng
Password: Admin@123
```

**Regular Employee:**
```
Username: bopha.lim
Password: Admin@123
```

## Important Notes

### ⚠️ Data Loss Warning
The seed script **deletes all existing data** before seeding. Only use this on:
- Fresh development environments
- Test databases
- When you want to reset to initial state

**Never run this on production databases!**

### 🔒 Security Considerations

1. **Change Default Passwords**: After seeding, change all default passwords
2. **Admin Account**: Secure the admin account immediately
3. **Environment Variables**: Keep `.env.local` secure and never commit it
4. **MongoDB Credentials**: Use strong passwords and rotate regularly

### 📝 Data Conventions

All seeded data follows the HRMIS design specifications:

- **Naming Convention**: snake_case for all database fields
- **Timezone**: Dates stored in UTC, displayed in Asia/Phnom_Penh (UTC+7)
- **Bilingual Support**: English and Khmer names for key entities
- **Status Fields**: All entities have active status by default
- **Soft Deletes**: Employee model includes `deleted_at` field (null by default)

## Customizing Seed Data

To modify the seed data:

1. Open `scripts/seed-database.ts`
2. Locate the relevant seed function:
   - `seedDepartments()` - Modify departments
   - `seedPositions()` - Modify positions
   - `seedEmployees()` - Modify employees
   - `seedUsers()` - Modify user accounts
   - `seedLeaveTypes()` - Modify leave types
3. Update the data arrays
4. Run `npm run seed` to apply changes

### Example: Adding a New Department

```typescript
{
  department_id: 'DEPT006',
  department_code: 'LEGAL',
  department_name: 'Legal',
  department_name_khmer: 'ផ្នែកច្បាប់',
  department_status: 'active',
}
```

## Troubleshooting

### Connection Errors

**Error:** `MongooseServerSelectionError`

**Solutions:**
1. Check MongoDB is running
2. Verify MONGODB_URI in `.env.local`
3. Add your IP to MongoDB Atlas whitelist
4. Check network connectivity

### Duplicate Key Errors

**Error:** `E11000 duplicate key error`

**Solutions:**
1. The script should clear collections first
2. Manually drop collections: `db.collection.drop()`
3. Check for existing data with same IDs

### Missing Dependencies

**Error:** `Cannot find module 'tsx'`

**Solution:**
```bash
npm install --save-dev tsx
```

### Password Hashing Errors

**Error:** Issues with bcrypt

**Solution:**
```bash
npm rebuild bcryptjs
```

## Verification Queries

After seeding, verify data using MongoDB queries:

```javascript
// Count documents
db.departments.countDocuments()  // Should be 5
db.positions.countDocuments()    // Should be 14
db.employees.countDocuments()    // Should be 10
db.users.countDocuments()        // Should be 10
db.leave_types.countDocuments()  // Should be 7
db.leave_balances.countDocuments() // Should be 70

// Check admin user
db.users.findOne({ username: 'admin' })

// Check department with manager
db.departments.findOne({ department_code: 'HR' })

// Check employee with Khmer name
db.employees.findOne({ employee_code: 'HR001' })

// Check leave balance
db.leave_balances.findOne({ employee_id: 'EMP001' })
```

## Next Steps

After successful seeding:

1. **Login**: Access the application at `http://localhost:3000`
2. **Change Passwords**: Update default passwords for security
3. **Test Features**: Verify all modules work correctly
4. **Add More Data**: Create additional test data as needed
5. **Development**: Start implementing and testing features

## Related Documentation

- [Setup Guide](../SETUP.md) - Initial project setup
- [Requirements](../.kiro/specs/hrmis-system/requirements.md) - System requirements
- [Design Document](../.kiro/specs/hrmis-system/design.md) - System design
- [Tasks](../.kiro/specs/hrmis-system/tasks.md) - Implementation tasks
