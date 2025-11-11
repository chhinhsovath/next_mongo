/**
 * Test script to verify database connection and models
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { connectDB } from '../src/lib/mongodb';
import { User, Employee, Department, Position, LeaveType } from '../src/models';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Connect to database
    await connectDB();
    console.log('✓ Database connection successful');

    // Test model compilation
    console.log('\nTesting model compilation...');
    console.log('✓ User model:', User.modelName);
    console.log('✓ Employee model:', Employee.modelName);
    console.log('✓ Department model:', Department.modelName);
    console.log('✓ Position model:', Position.modelName);
    console.log('✓ LeaveType model:', LeaveType.modelName);

    // Check indexes
    console.log('\nChecking indexes...');
    const employeeIndexes = await Employee.collection.getIndexes();
    console.log('✓ Employee indexes:', Object.keys(employeeIndexes).join(', '));

    const departmentIndexes = await Department.collection.getIndexes();
    console.log('✓ Department indexes:', Object.keys(departmentIndexes).join(', '));

    const positionIndexes = await Position.collection.getIndexes();
    console.log('✓ Position indexes:', Object.keys(positionIndexes).join(', '));

    const leaveTypeIndexes = await LeaveType.collection.getIndexes();
    console.log('✓ LeaveType indexes:', Object.keys(leaveTypeIndexes).join(', '));

    const userIndexes = await User.collection.getIndexes();
    console.log('✓ User indexes:', Object.keys(userIndexes).join(', '));

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
