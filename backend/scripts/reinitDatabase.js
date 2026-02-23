const sequelize = require('../config/database');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');

async function reinitDatabase() {
  try {
    console.log('🔄 Reinitializing database...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Drop all tables and recreate
    await sequelize.sync({ force: true });
    console.log('✅ Tables created');

    // Create admin accounts with proper permissions
    const admins = [
      {
        userId: 'ADMIN_BANK_001',
        email: 'admin.bank@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Bank',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'bank',
        department: 'Administration',
        city: 'Mumbai',
        phone: '+91 9999000001',
        isActive: true,
        mfaEnabled: false,
        biometricEnabled: false,
        permissions: [
          'view_all',
          'manage_users',
          'approve_transactions',
          'view_reports',
          'system_settings',
          'manage_permissions',
          'access_accounts',
          'access_transactions',
          'access_loans',
          'access_kyc',
          'access_compliance'
        ]
      },
      {
        userId: 'ADMIN_HOSPITAL_001',
        email: 'admin.hospital@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Hospital',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'hospital',
        department: 'Administration',
        city: 'Delhi',
        phone: '+91 9999000002',
        isActive: true,
        mfaEnabled: false,
        biometricEnabled: false,
        permissions: [
          'view_all',
          'manage_staff',
          'system_settings',
          'all_records',
          'manage_permissions',
          'access_patients',
          'access_records',
          'access_pharmacy',
          'access_lab',
          'access_billing'
        ]
      }
    ];

    for (const admin of admins) {
      await User.create(admin);
      console.log(`✅ Created admin: ${admin.email}`);
    }

    // Create regular users with limited permissions
    const industries = ['bank', 'hospital'];
    const industryUsers = {
      bank: [
        {
          userId: 'BANK_MGR_001',
          email: 'manager.bank@rolewatch.in',
          password: 'Demo@2024',
          firstName: 'Rahul',
          lastName: 'Sharma',
          role: 'manager',
          industry: 'bank',
          department: 'Corporate Banking',
          city: 'Mumbai',
          phone: '+91 9876543210',
          permissions: ['view_reports', 'approve_transactions', 'access_accounts', 'access_loans']
        },
        {
          userId: 'BANK_OFF_001',
          email: 'officer.bank@rolewatch.in',
          password: 'Demo@2024',
          firstName: 'Priya',
          lastName: 'Patel',
          role: 'officer',
          industry: 'bank',
          department: 'Customer Service',
          city: 'Mumbai',
          phone: '+91 9876543211',
          permissions: ['access_accounts', 'access_transactions']
        },
        {
          userId: 'BANK_STAFF_001',
          email: 'staff.bank@rolewatch.in',
          password: 'Demo@2024',
          firstName: 'Amit',
          lastName: 'Kumar',
          role: 'staff',
          industry: 'bank',
          department: 'Operations',
          city: 'Mumbai',
          phone: '+91 9876543212',
          permissions: ['access_accounts']
        }
      ],
      hospital: [
        {
          userId: 'HOSP_DOC_001',
          email: 'doctor.hospital@rolewatch.in',
          password: 'Demo@2024',
          firstName: 'Dr. Neha',
          lastName: 'Singh',
          role: 'manager',
          industry: 'hospital',
          department: 'Cardiology',
          city: 'Delhi',
          phone: '+91 9876543220',
          permissions: ['access_patients', 'access_records', 'access_lab', 'access_pharmacy']
        },
        {
          userId: 'HOSP_NURSE_001',
          email: 'nurse.hospital@rolewatch.in',
          password: 'Demo@2024',
          firstName: 'Anjali',
          lastName: 'Verma',
          role: 'officer',
          industry: 'hospital',
          department: 'Nursing',
          city: 'Delhi',
          phone: '+91 9876543221',
          permissions: ['access_patients', 'access_records']
        },
        {
          userId: 'HOSP_STAFF_001',
          email: 'staff.hospital@rolewatch.in',
          password: 'Demo@2024',
          firstName: 'Suresh',
          lastName: 'Gupta',
          role: 'staff',
          industry: 'hospital',
          department: 'Reception',
          city: 'Delhi',
          phone: '+91 9876543222',
          permissions: ['access_patients']
        }
      ]
    };

    for (const industry in industryUsers) {
      for (const userData of industryUsers[industry]) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    // Create sample audit logs
    const users = await User.findAll();
    for (const user of users.slice(0, 5)) {
      await AuditLog.create({
        userId: user.id,
        action: 'login',
        resource: 'system',
        status: 'success',
        ipAddress: '103.123.45.67',
        location: user.city,
        device: 'Chrome/Windows',
        riskScore: Math.floor(Math.random() * 30)
      });
    }

    console.log('');
    console.log('✅✅✅ DATABASE READY ✅✅✅');
    console.log('');
    console.log('ADMIN ACCOUNTS:');
    console.log('  Banking Admin: admin.bank@rolewatch.in / Admin@2024');
    console.log('  Hospital Admin: admin.hospital@rolewatch.in / Admin@2024');
    console.log('');
    console.log('TEST USERS (Password: Demo@2024):');
    console.log('  Banking Manager: manager.bank@rolewatch.in');
    console.log('  Banking Officer: officer.bank@rolewatch.in');
    console.log('  Banking Staff: staff.bank@rolewatch.in');
    console.log('  Hospital Doctor: doctor.hospital@rolewatch.in');
    console.log('  Hospital Nurse: nurse.hospital@rolewatch.in');
    console.log('  Hospital Staff: staff.hospital@rolewatch.in');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

reinitDatabase();
