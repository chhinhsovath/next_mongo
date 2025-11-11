# Database Seeding Scripts

## Overview

This directory contains scripts for seeding the HRMIS database with initial data.

## seed-database.ts

Seeds the database with initial data including:

- **Admin User Account**: Default admin user with full system access
- **Departments**: 5 sample departments with English and Khmer names
  - Human Resources (ធនធានមនុស្ស)
  - Information Technology (បច្ចេកវិទ្យាព័ត៌មាន)
  - Finance (ហិរញ្ញវត្ថុ)
  - Operations (ប្រតិបត្តិការ)
  - Sales & Marketing (លក់និងទីផ្សារ)

- **Positions**: 14 positions across all departments with Khmer names
- **Employees**: 10 sample employees with Khmer name fields
- **Users**: User accounts for all employees with role-based access
- **Leave Types**: 7 leave types with Khmer names
  - Annual Leave (ច្បាប់ប្រចាំឆ្នាំ)
  - Sick Leave (ច្បាប់ឈឺ)
  - Personal Leave (ច្បាប់ផ្ទាល់ខ្លួន)
  - Maternity Leave (ច្បាប់សម្រាល)
  - Paternity Leave (ច្បាប់បិតា)
  - Unpaid Leave (ច្បាប់គ្មានប្រាក់ខែ)
  - Compassionate Leave (ច្បាប់កង្វល់)

- **Leave Balances**: Initial leave balances for all employees for the current year

## Usage

### Prerequisites

1. Ensure MongoDB is running and accessible
2. Set up environment variables in `.env.local`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=sangapac_hrmis
   ```

### Running the Seed Script

```bash
npm run seed
```

### What the Script Does

1. **Connects to MongoDB** using the connection string from environment variables
2. **Clears existing data** from all collections (⚠️ Warning: This will delete all existing data)
3. **Seeds data** in the following order:
   - Departments
   - Positions
   - Employees
   - Users
   - Leave Types
   - Leave Balances
4. **Updates relationships** (e.g., assigns department managers)
5. **Displays summary** of seeded data

### Default Credentials

After seeding, you can log in with:

**Admin Account:**
- Username: `admin`
- Password: `Admin@123`

**Other User Accounts:**
All users have the same default password: `Admin@123`

Available usernames:
- `admin` (Admin role)
- `sokha.chan` (HR Manager role)
- `dara.pov` (Employee role)
- `virak.seng` (Manager role - IT)
- `sreymom.keo` (Manager role - IT)
- `bopha.lim` (Employee role)
- `ratanak.heng` (Employee role)
- `sophea.mao` (Manager role - Finance)
- `piseth.tan` (Manager role - Finance)
- `chenda.sok` (Employee role)

### Sample Data Structure

#### Departments
- HR (DEPT001) - Manager: Admin User
- IT (DEPT002) - Manager: Virak Seng
- Finance (DEPT003) - Manager: Sophea Mao
- Operations (DEPT004)
- Sales & Marketing (DEPT005)

#### User Roles
- **Admin** (1): Full system access
- **HR Manager** (1): HR operations and employee management
- **Manager** (4): Department management, leave approvals, performance evaluations
- **Employee** (4): Basic access to personal information

### Important Notes

⚠️ **Warning**: This script will **delete all existing data** in the database before seeding. Only run this on development or test environments.

🔒 **Security**: Change the default passwords immediately after seeding in production environments.

🌍 **Timezone**: All dates are stored in UTC. The system displays them in Asia/Phnom_Penh timezone (UTC+7).

📝 **Naming Convention**: All database fields use snake_case as per the design specification.

### Troubleshooting

**Connection Error:**
- Verify MongoDB is running
- Check MONGODB_URI in `.env.local`
- Ensure network connectivity to MongoDB Atlas

**Duplicate Key Error:**
- The script clears collections before seeding
- If you see this error, manually drop the collections and try again

**Missing Dependencies:**
- Run `npm install` to ensure all dependencies are installed
- Ensure `tsx` is installed as a dev dependency

## Customization

To customize the seed data:

1. Edit `scripts/seed-database.ts`
2. Modify the data arrays in each seed function
3. Run `npm run seed` to apply changes

## Additional Scripts

### test-db-connection.ts

Tests the MongoDB connection to verify database connectivity.

```bash
npx tsx scripts/test-db-connection.ts
```
