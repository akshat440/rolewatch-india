const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class MFAService {
  // Generate TOTP secret
  async generateTOTPSecret(userId, email) {
    const secret = speakeasy.generateSecret({
      name: `RoleWatch India (${email})`,
      issuer: 'RoleWatch'
    });

    return {
      secret: secret.base32,
      qrCode: await qrcode.toDataURL(secret.otpauth_url),
      backupCodes: this.generateBackupCodes()
    };
  }

  // Verify TOTP token
  verifyTOTP(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });
  }

  // Generate backup codes
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  // Send SMS OTP (simulation)
  async sendSMSOTP(phone, otp) {
    console.log(`📱 SMS OTP to ${phone}: ${otp}`);
    
    // In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
    return {
      success: true,
      message: `OTP sent to ${phone}`,
      expiresIn: 300 // 5 minutes
    };
  }

  // Send Email OTP (simulation)
  async sendEmailOTP(email, otp) {
    console.log(`📧 Email OTP to ${email}: ${otp}`);
    
    // In production, integrate with email service
    return {
      success: true,
      message: `OTP sent to ${email}`,
      expiresIn: 300
    };
  }

  // Generate random OTP
  generateOTP(length = 6) {
    return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  }
}

module.exports = new MFAService();
