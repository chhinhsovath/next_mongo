# HRMIS Quick Start Guide

Get up and running with the HRMIS system in minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas access (connection string provided)
- Git (to clone the repository)

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

The MongoDB connection is already configured in `.env.local`.

### 3. Seed the Database

Populate the database with initial test data:

```bash
npm run seed
```

This creates:
- 5 departments
- 14 positions
- 10 employees
- 10 user accounts
- 7 leave types
- 70 leave balances

### 4. Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Login

Use the admin credentials:

- **Username**: `admin`
- **Password**: `Admin@123`

🎉 **You're ready to go!**

## What's Included

### Sample Users

All users have the password: `Admin@123`

**Admin Access:**
- Username: `admin` (full system access)

**HR Manager:**
- Username: `sokha.chan` (HR operations)

**Department Managers:**
- Username: `virak.seng` (IT Director)
- Username: `sreymom.keo` (Development Lead)
- Username: `sophea.mao` (Finance Director)
- Username: `piseth.tan` (Accounting Manager)

**Regular Employees:**
- Username: `dara.pov` (HR Specialist)
- Username: `bopha.lim` (Senior Developer)
- Username: `ratanak.heng` (Junior Developer)
- Username: `chenda.sok` (Accountant)

### Sample Data

- **5 Departments**: HR, IT, Finance, Operations, Sales & Marketing
- **14 Positions**: Various roles across departments
- **10 Employees**: Complete employee records with Khmer names
- **7 Leave Types**: Annual, Sick, Personal, Maternity, Paternity, Unpaid, Compassionate
- **Full Leave Balances**: All employees start with full leave quotas

## Quick Test Scenarios

### Test 1: View Employees (30 seconds)

1. Login as `admin` / `Admin@123`
2. Click "Employees" in the sidebar
3. See all 10 employees listed
4. Click on an employee to view details

### Test 2: Submit Leave Request (2 minutes)

1. Login as `bopha.lim` / `Admin@123`
2. Navigate to "Leave" → "My Requests"
3. Click "New Leave Request"
4. Select leave type and dates
5. Submit request
6. See request in "Pending" status

### Test 3: Approve Leave Request (2 minutes)

1. Logout and login as `virak.seng` / `Admin@123` (Manager)
2. Navigate to "Leave" → "Approvals"
3. See pending request from Bopha Lim
4. Click "Approve"
5. Request status changes to "Approved"

### Test 4: View Dashboard (1 minute)

1. Login as any user
2. View personalized dashboard
3. See leave balance summary
4. View recent activity
5. Access quick actions

### Test 5: Generate Report (2 minutes)

1. Login as `admin` / `Admin@123`
2. Navigate to "Reports"
3. Select "Employee Headcount"
4. Generate report
5. View breakdown by department
6. Export to PDF or Excel

## Available Features

### ✅ Employee Management
- Create, view, update, delete employees
- Search and filter employees
- View employee details with tabs
- Manage employee assignments

### ✅ Leave Management
- Submit leave requests
- Approve/reject requests (managers)
- Track leave balances
- View leave history
- Multiple leave types

### ✅ Attendance Tracking
- Check-in/check-out with GPS
- View attendance calendar
- Generate attendance reports
- Track work hours
- Absence detection

### ✅ Payroll Processing
- Generate payroll records
- View payslips
- Calculate net salary
- Track deductions
- Export payroll data

### ✅ Performance Evaluation
- Create evaluations
- Rate on multiple criteria
- View performance history
- Track performance trends
- Employee acknowledgment

### ✅ Organization Management
- Manage departments
- Manage positions
- Assign department heads
- View organizational structure

### ✅ Reporting
- Employee headcount reports
- Leave utilization reports
- Attendance summary reports
- Payroll summary reports
- Export to PDF/Excel

### ✅ Security Features
- Role-based access control
- Session management
- Password security
- CSRF protection
- Rate limiting
- Audit logging

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage

# Database
npm run seed             # Seed database with initial data
```

## Resetting Data

To reset the database to initial state:

```bash
npm run seed
```

⚠️ **Warning**: This deletes ALL existing data!

## Troubleshooting

### Can't connect to MongoDB?
- Check `.env.local` has correct MONGODB_URI
- Verify your IP is whitelisted in MongoDB Atlas
- Check internet connection

### Seeding fails?
- Ensure MongoDB is accessible
- Check environment variables
- See [Database Seeding Guide](docs/database-seeding-guide.md)

### Login not working?
- Verify you ran `npm run seed`
- Check username and password (case-sensitive)
- Try resetting: `npm run seed`

### Page not loading?
- Ensure dev server is running: `npm run dev`
- Check console for errors
- Clear browser cache

## Next Steps

### For Developers

1. **Explore the Code**: Check out the project structure
2. **Read Documentation**: See `docs/` folder for detailed guides
3. **Run Tests**: `npm run test` to verify everything works
4. **Make Changes**: Start implementing new features
5. **Follow Tasks**: See `.kiro/specs/hrmis-system/tasks.md`

### For Testers

1. **Test All Features**: Go through each module
2. **Try Different Roles**: Login as different users
3. **Test Workflows**: Complete end-to-end scenarios
4. **Report Issues**: Document any bugs found
5. **Verify Requirements**: Check against requirements document

### For Managers

1. **Review Features**: Explore all available functionality
2. **Test Workflows**: Verify business processes
3. **Check Reports**: Review reporting capabilities
4. **Provide Feedback**: Share improvement suggestions
5. **Plan Deployment**: Prepare for production rollout

## Documentation

- **[README.md](README.md)** - Project overview
- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[Database Seeding Guide](docs/database-seeding-guide.md)** - Comprehensive seeding documentation
- **[Seeded Data Reference](docs/seeded-data-reference.md)** - Quick reference for test data
- **[Requirements](/.kiro/specs/hrmis-system/requirements.md)** - System requirements
- **[Design Document](/.kiro/specs/hrmis-system/design.md)** - System design
- **[Tasks](/.kiro/specs/hrmis-system/tasks.md)** - Implementation tasks

## Support

For issues or questions:

1. Check the documentation in `docs/` folder
2. Review the troubleshooting section above
3. Check the implementation summaries in `docs/`
4. Review the design document for specifications

## Important Notes

🔒 **Security**: Change all default passwords before production use!

🌍 **Timezone**: System uses Asia/Phnom_Penh timezone (UTC+7)

📝 **Naming**: All database fields use snake_case convention

🌐 **Bilingual**: System supports English and Khmer languages

---

**Happy coding! 🚀**
