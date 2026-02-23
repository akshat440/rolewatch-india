const sequelize = require('../config/database');
const User = require('../models/User');

async function addCEOUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const ceoUsers = [
      {
        userId: 'CEO_BANK_001',
        email: 'ceo.bank@rolewatch.in',
        password: 'CEO@2024',
        firstName: 'Rajesh',
        lastName: 'Mehta',
        role: 'ceo',
        industry: 'bank',
        department: 'Executive Office',
        city: 'Mumbai',
        phone: '+91 9999111001',
        isActive: true,
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
          'access_compliance',
          'access_classified_data',
          'approve_high_security',
          'access_executive_reports'
        ]
      },
      {
        userId: 'CEO_HOSPITAL_001',
        email: 'ceo.hospital@rolewatch.in',
        password: 'CEO@2024',
        firstName: 'Dr. Anjali',
        lastName: 'Kapoor',
        role: 'ceo',
        industry: 'hospital',
        department: 'Executive Office',
        city: 'Delhi',
        phone: '+91 9999111002',
        isActive: true,
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
          'access_billing',
          'access_classified_data',
          'approve_high_security',
          'access_executive_reports'
        ]
      }
    ];

    for (const ceoData of ceoUsers) {
      const existing = await User.findOne({ where: { email: ceoData.email } });
      
      if (!existing) {
        await User.create(ceoData);
        console.log(`✅ Created CEO: ${ceoData.email}`);
      } else {
        console.log(`⏭️  CEO already exists: ${ceoData.email}`);
      }
    }

    console.log('');
    console.log('✅ CEO CREDENTIALS:');
    console.log('  Banking CEO: ceo.bank@rolewatch.in / CEO@2024');
    console.log('  Hospital CEO: ceo.hospital@rolewatch.in / CEO@2024');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCEOUsers();
