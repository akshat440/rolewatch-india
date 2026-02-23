const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Demo@2024';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test it
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Verification:', isMatch ? '✅ Valid' : '❌ Invalid');
}

generateHash();
