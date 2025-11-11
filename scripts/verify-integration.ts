/**
 * Integration Verification Script
 * 
 * This script verifies that all modules are properly integrated and working
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface VerificationResult {
  module: string;
  status: 'pass' | 'fail';
  message: string;
}

const results: VerificationResult[] = [];

async function verifyDatabaseConnection(): Promise<boolean> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      results.push({
        module: 'Database Connection',
        status: 'fail',
        message: 'MONGODB_URI not found in environment variables',
      });
      return false;
    }

    await mongoose.connect(mongoUri);
    results.push({
      module: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to MongoDB',
    });
    return true;
  } catch (error: any) {
    results.push({
      module: 'Database Connection',
      status: 'fail',
      message: `Failed to connect: ${error.message}`,
    });
    return false;
  }
}

async function verifyCollections(): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      results.push({
        module: 'Database Collections',
        status: 'fail',
        message: 'Database connection not established',
      });
      return;
    }
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const requiredCollections = [
      'users',
      'employees',
      'departments',
      'positions',
      'leave_requests',
      'leave_types',
      'leave_balances',
      'attendances',
      'payrolls',
      'performance_evaluations',
    ];

    const missingCollections = requiredCollections.filter(
      (name) => !collectionNames.includes(name)
    );

    if (missingCollections.length === 0) {
      results.push({
        module: 'Database Collections',
        status: 'pass',
        message: `All ${requiredCollections.length} required collections exist`,
      });
    } else {
      results.push({
        module: 'Database Collections',
        status: 'fail',
        message: `Missing collections: ${missingCollections.join(', ')}`,
      });
    }
  } catch (error: any) {
    results.push({
      module: 'Database Collections',
      status: 'fail',
      message: `Failed to verify collections: ${error.message}`,
    });
  }
}

async function verifyDataIntegrity(): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      results.push({
        module: 'Data Integrity',
        status: 'fail',
        message: 'Database connection not established',
      });
      return;
    }
    
    // Check if admin user exists
    const usersCount = await db.collection('users').countDocuments();
    
    // Check if departments exist
    const departmentsCount = await db
      .collection('departments')
      .countDocuments();
    
    // Check if positions exist
    const positionsCount = await db
      .collection('positions')
      .countDocuments();
    
    // Check if leave types exist
    const leaveTypesCount = await db
      .collection('leave_types')
      .countDocuments();

    const checks = [
      { name: 'Users', count: usersCount, min: 1 },
      { name: 'Departments', count: departmentsCount, min: 1 },
      { name: 'Positions', count: positionsCount, min: 1 },
      { name: 'Leave Types', count: leaveTypesCount, min: 1 },
    ];

    const failedChecks = checks.filter((check) => check.count < check.min);

    if (failedChecks.length === 0) {
      results.push({
        module: 'Data Integrity',
        status: 'pass',
        message: 'All required seed data exists',
      });
    } else {
      results.push({
        module: 'Data Integrity',
        status: 'fail',
        message: `Missing data: ${failedChecks.map((c) => c.name).join(', ')}`,
      });
    }
  } catch (error: any) {
    results.push({
      module: 'Data Integrity',
      status: 'fail',
      message: `Failed to verify data: ${error.message}`,
    });
  }
}

async function verifyIndexes(): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      results.push({
        module: 'Database Indexes',
        status: 'fail',
        message: 'Database connection not established',
      });
      return;
    }
    
    const employeesIndexes = await db
      .collection('employees')
      .indexes();
    
    const requiredIndexes = ['employee_code', 'email'];
    const existingIndexNames = employeesIndexes.map((idx) => Object.keys(idx.key)[0]);
    
    const missingIndexes = requiredIndexes.filter(
      (name) => !existingIndexNames.includes(name)
    );

    if (missingIndexes.length === 0) {
      results.push({
        module: 'Database Indexes',
        status: 'pass',
        message: 'All required indexes exist',
      });
    } else {
      results.push({
        module: 'Database Indexes',
        status: 'fail',
        message: `Missing indexes: ${missingIndexes.join(', ')}`,
      });
    }
  } catch (error: any) {
    results.push({
      module: 'Database Indexes',
      status: 'fail',
      message: `Failed to verify indexes: ${error.message}`,
    });
  }
}

async function verifyEnvironmentVariables(): Promise<void> {
  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length === 0) {
    results.push({
      module: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are set',
    });
  } else {
    results.push({
      module: 'Environment Variables',
      status: 'fail',
      message: `Missing variables: ${missingVars.join(', ')}`,
    });
  }
}

function printResults(): void {
  console.log('\n' + '='.repeat(70));
  console.log('HRMIS INTEGRATION VERIFICATION RESULTS');
  console.log('='.repeat(70) + '\n');

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✓' : '✗';
    const color = result.status === 'pass' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${icon}${reset} ${result.module}`);
    console.log(`  ${result.message}\n`);
  });

  console.log('='.repeat(70));
  console.log(`Total: ${results.length} checks`);
  console.log(`\x1b[32mPassed: ${passCount}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failCount}\x1b[0m`);
  console.log('='.repeat(70) + '\n');

  if (failCount > 0) {
    console.log('\x1b[33mWarning: Some checks failed. Please review the issues above.\x1b[0m\n');
  } else {
    console.log('\x1b[32m✓ All integration checks passed successfully!\x1b[0m\n');
  }
}

async function main() {
  console.log('Starting HRMIS integration verification...\n');

  // Verify environment variables first
  verifyEnvironmentVariables();

  // Connect to database
  const connected = await verifyDatabaseConnection();

  if (connected) {
    // Run database checks
    await verifyCollections();
    await verifyDataIntegrity();
    await verifyIndexes();

    // Close connection
    await mongoose.connection.close();
  }

  // Print results
  printResults();

  // Exit with appropriate code
  const hasFailures = results.some((r) => r.status === 'fail');
  process.exit(hasFailures ? 1 : 0);
}

main().catch((error) => {
  console.error('Verification script failed:', error);
  process.exit(1);
});
