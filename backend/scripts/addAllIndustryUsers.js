const sequelize = require('../config/database');
const User = require('../models/User');

async function addAllIndustryUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const allUsers = [
      // POLICE INDUSTRY
      {
        userId: 'POLICE_ADMIN_001',
        email: 'admin.police@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Police',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'police',
        department: 'Administration',
        city: 'Delhi',
        phone: '+91 9999000003',
        isActive: true,
        permissions: ['view_all', 'manage_officers', 'system_access', 'classified_cases', 'view_cases', 'update_cases', 'access_cctns', 'access_nafis', 'access_investigations']
      },
      {
        userId: 'POLICE_INS_001',
        email: 'inspector.police@rolewatch.in',
        password: 'Demo@2024',
        firstName: 'Vikram',
        lastName: 'Rao',
        role: 'manager',
        industry: 'police',
        department: 'Crime Investigation',
        city: 'Delhi',
        phone: '+91 9876543230',
        permissions: ['view_cases', 'update_cases', 'access_investigations', 'access_cctns']
      },
      {
        userId: 'POLICE_CONST_001',
        email: 'constable.police@rolewatch.in',
        password: 'Demo@2024',
        firstName: 'Rajesh',
        lastName: 'Patil',
        role: 'officer',
        industry: 'police',
        department: 'Patrol',
        city: 'Mumbai',
        phone: '+91 9876543231',
        permissions: ['view_cases', 'access_cctns']
      },

      // GOVERNMENT INDUSTRY
      {
        userId: 'GOV_ADMIN_001',
        email: 'admin.government@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'Government',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'government',
        department: 'Administration',
        city: 'New Delhi',
        phone: '+91 9999000004',
        isActive: true,
        permissions: ['view_all', 'manage_users', 'system_settings', 'classified_docs', 'view_files', 'approve_requests', 'access_rti', 'access_eoffice', 'access_digilocker']
      },
      {
        userId: 'GOV_OFFICER_001',
        email: 'officer.government@rolewatch.in',
        password: 'Demo@2024',
        firstName: 'Sunita',
        lastName: 'Sharma',
        role: 'manager',
        industry: 'government',
        department: 'Public Services',
        city: 'New Delhi',
        phone: '+91 9876543240',
        permissions: ['view_files', 'approve_requests', 'access_eoffice', 'access_rti']
      },
      {
        userId: 'GOV_CLERK_001',
        email: 'clerk.government@rolewatch.in',
        password: 'Demo@2024',
        firstName: 'Mahesh',
        lastName: 'Kumar',
        role: 'staff',
        industry: 'government',
        department: 'Records',
        city: 'New Delhi',
        phone: '+91 9876543241',
        permissions: ['view_files', 'access_eoffice']
      },

      // EDUCATION/COLLEGE INDUSTRY
      {
        userId: 'COLLEGE_ADMIN_001',
        email: 'admin.college@rolewatch.in',
        password: 'Admin@2024',
        firstName: 'College',
        lastName: 'Administrator',
        role: 'admin',
        industry: 'college',
        department: 'Administration',
        city: 'Bangalore',
        phone: '+91 9999000005',
        isActive: true,
        permissions: ['view_all', 'manage_faculty', 'system_settings', 'all_records', 'view_students', 'enter_grades', 'access_academic', 'access_examinations', 'access_library']
      },
      {
        userId: 'COLLEGE_PROF_001',
        email: 'professor.college@rolewatch.in',
        password: 'Demo@2024',
        firstName: 'Dr. Anjali',
        lastName: 'Verma',
        role: 'manager',
        industry: 'college',
        department: 'Computer Science',
        city: 'Bangalore',
        phone: '+91 9876543250',
        permissions: ['view_students', 'enter_grades', 'access_academic', 'access_library']
      },
      {
        userId: 'COLLEGE_STAFF_001',
        email: 'staff.college@rolewatch.in',
        password: 'Demo@2024',
        firstName: 'Ramesh',
        lastName: 'Nair',
        role: 'staff',
        industry: 'college',
        department: 'Administration',
        city: 'Bangalore',
        phone: '+91 9876543251',
        permissions: ['view_students', 'access_library']
      }
    ];

    for (const userData of allUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created: ${userData.email}`);
      } else {
        console.log(`⏭️  Already exists: ${userData.email}`);
      }
    }

    const totalUsers = await User.count();
    console.log('');
    console.log(`✅ Total users in database: ${totalUsers}`);
    console.log('');
    console.log('LOGIN CREDENTIALS:');
    console.log('==================');
    console.log('ADMINS (Password: Admin@2024):');
    console.log('  - admin.bank@rolewatch.in');
    console.log('  - admin.hospital@rolewatch.in');
    console.log('  - admin.police@rolewatch.in');
    console.log('  - admin.government@rolewatch.in');
    console.log('  - admin.college@rolewatch.in');
    console.log('');
    console.log('REGULAR USERS (Password: Demo@2024):');
    console.log('  - staff.bank@rolewatch.in');
    console.log('  - inspector.police@rolewatch.in');
    console.log('  - officer.government@rolewatch.in');
    console.log('  - professor.college@rolewatch.in');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAllIndustryUsers();
