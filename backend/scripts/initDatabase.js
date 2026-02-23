const sequelize = require('../config/database');
const User = require('../models/User');
const Permission = require('../models/Permission');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully');

    console.log('Creating tables...');
    await sequelize.sync({ force: true });
    console.log('Tables created');

    console.log('Creating admin accounts...');
    
    const adminAccounts = [
      {
        userId: 'ADMIN_BANK',
        email: 'admin.bank@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Bank',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'bank',
        department: 'Administration',
        city: 'Mumbai',
        phone: '+91 9999000001',
        permissions: ['view_all', 'manage_users', 'approve_transactions', 'view_reports', 'system_settings', 'manage_permissions']
      },
      {
        userId: 'ADMIN_HOSPITAL',
        email: 'admin.hospital@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Hospital',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'hospital',
        department: 'Administration',
        city: 'Delhi',
        phone: '+91 9999000002',
        permissions: ['view_all', 'manage_staff', 'system_settings', 'all_records', 'manage_permissions']
      },
      {
        userId: 'ADMIN_POLICE',
        email: 'admin.police@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Police',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'police',
        department: 'Administration',
        city: 'Bangalore',
        phone: '+91 9999000003',
        permissions: ['view_all', 'manage_officers', 'system_access', 'classified_cases', 'manage_permissions']
      },
      {
        userId: 'ADMIN_GOV',
        email: 'admin.government@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Government',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'government',
        department: 'Administration',
        city: 'Delhi',
        phone: '+91 9999000004',
        permissions: ['view_all', 'manage_users', 'system_settings', 'classified_docs', 'manage_permissions']
      },
      {
        userId: 'ADMIN_COLLEGE',
        email: 'admin.college@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'College',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'college',
        department: 'Administration',
        city: 'Pune',
        phone: '+91 9999000005',
        permissions: ['view_all', 'manage_faculty', 'system_settings', 'all_records', 'manage_permissions']
      }
    ];

    for (const admin of adminAccounts) {
      await User.create(admin);
    }

    console.log('Loading sample users from datasets...');
    
    const industries = ['bank', 'hospital', 'police', 'government', 'college'];
    let totalUsers = 5;

    for (const industry of industries) {
      const filePath = path.join(__dirname, `../../datasets/indian_${industry}_users.json`);
      
      if (fs.existsSync(filePath)) {
        const usersData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        for (const userData of usersData.slice(0, 10)) {
          try {
            const role = inferRole(userData);
            await User.create({
              userId: userData.user_id,
              email: userData.email,
              password: 'Demo@2024',
              firstName: userData.first_name,
              lastName: userData.last_name,
              role: role,
              industry: industry,
              department: userData.department,
              city: userData.branch_location || userData.hospital_location || 
                    userData.station_location || userData.office_location || 
                    userData.campus_location || 'Mumbai',
              phone: userData.phone || '+91 9999999999',
              isActive: true,
              permissions: getDefaultPermissions(role, industry)
            });
            totalUsers++;
          } catch (error) {
            console.log(`Skipping duplicate: ${userData.email}`);
          }
        }
      }
    }

    console.log('');
    console.log('Database initialized successfully');
    console.log('Total users created:', totalUsers);
    console.log('');
    console.log('Admin Accounts:');
    console.log('  Banking: admin.bank@rolewatch.in / Admin@2024');
    console.log('  Hospital: admin.hospital@rolewatch.in / Admin@2024');
    console.log('  Police: admin.police@rolewatch.in / Admin@2024');
    console.log('  Government: admin.government@rolewatch.in / Admin@2024');
    console.log('  College: admin.college@rolewatch.in / Admin@2024');
    console.log('');
    console.log('Regular users password: Demo@2024');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

function inferRole(user) {
  const title = (user.role || user.designation || user.rank || '').toLowerCase();
  if (title.includes('admin') || title.includes('manager')) return 'manager';
  if (title.includes('officer')) return 'officer';
  return 'staff';
}

function getDefaultPermissions(role, industry) {
  const perms = {
    bank: {
      admin: ['view_all', 'manage_users', 'approve_transactions', 'system_settings'],
      manager: ['view_team', 'approve_loans', 'view_reports'],
      officer: ['view_accounts', 'process_transactions'],
      staff: ['view_accounts']
    },
    hospital: {
      admin: ['view_all', 'manage_staff', 'system_settings'],
      manager: ['view_patients', 'update_records', 'prescribe'],
      officer: ['view_patients', 'update_vitals'],
      staff: ['view_basic_info']
    },
    police: {
      admin: ['view_all', 'manage_officers', 'classified_cases'],
      manager: ['view_cases', 'update_cases', 'evidence_access'],
      officer: ['view_assigned_cases', 'update_reports'],
      staff: ['view_cases']
    },
    government: {
      admin: ['view_all', 'manage_users', 'classified_docs'],
      manager: ['view_files', 'approve_requests'],
      officer: ['view_assigned_files'],
      staff: ['data_entry']
    },
    college: {
      admin: ['view_all', 'manage_faculty', 'system_settings'],
      manager: ['view_students', 'enter_grades'],
      officer: ['view_assigned_students', 'enter_attendance'],
      staff: ['basic_access']
    }
  };
  return perms[industry]?.[role] || [];
}

initDatabase();
