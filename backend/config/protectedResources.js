// Define what resources exist and what permissions are needed to access them

const PROTECTED_RESOURCES = {
  bank: {
    accounts: {
      name: 'Account Management',
      requiredPermission: 'access_accounts',
      description: 'View and manage customer accounts',
      icon: 'user'
    },
    transactions: {
      name: 'Transactions',
      requiredPermission: 'access_transactions',
      description: 'Process and view transactions',
      icon: 'chart'
    },
    loans: {
      name: 'Loan Management',
      requiredPermission: 'access_loans',
      description: 'Manage loan applications and approvals',
      icon: 'dashboard'
    },
    kyc: {
      name: 'KYC Verification',
      requiredPermission: 'access_kyc',
      description: 'Customer KYC documents and verification',
      icon: 'shield'
    },
    compliance: {
      name: 'Compliance Reports',
      requiredPermission: 'access_compliance',
      description: 'RBI compliance and regulatory reports',
      icon: 'lock'
    },
    reports: {
      name: 'Reports',
      requiredPermission: 'view_reports',
      description: 'Financial reports and analytics',
      icon: 'chart'
    }
  },
  hospital: {
    patients: {
      name: 'Patient Records',
      requiredPermission: 'access_patients',
      description: 'View patient information',
      icon: 'user'
    },
    records: {
      name: 'Medical Records',
      requiredPermission: 'access_records',
      description: 'Access and update medical records',
      icon: 'dashboard'
    },
    pharmacy: {
      name: 'Pharmacy',
      requiredPermission: 'access_pharmacy',
      description: 'Medicine dispensation and inventory',
      icon: 'hospital'
    },
    lab: {
      name: 'Laboratory',
      requiredPermission: 'access_lab',
      description: 'Lab tests and results',
      icon: 'chart'
    },
    billing: {
      name: 'Billing',
      requiredPermission: 'access_billing',
      description: 'Patient billing and payments',
      icon: 'bank'
    }
  }
};

module.exports = PROTECTED_RESOURCES;
