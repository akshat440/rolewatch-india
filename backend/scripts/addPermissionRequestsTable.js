const sequelize = require('../config/database');
require('../models');

async function addTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Sync only the new table
    await sequelize.sync({ alter: true });
    console.log('✅ Permission requests table created');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTable();
