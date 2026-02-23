export const INDUSTRIES = {
  BANK: {
    id: 'bank',
    name: 'Banking & Finance',
    icon: 'bank',
    color: '#2563eb',
    compliance: ['RBI', 'PCI-DSS'],
    modules: ['Accounts', 'Transactions', 'Loans', 'KYC', 'Compliance']
  },
  HOSPITAL: {
    id: 'hospital',
    name: 'Healthcare',
    icon: 'hospital',
    color: '#dc2626',
    compliance: ['NABH', 'DPDP Act 2023'],
    modules: ['Patients', 'Records', 'Pharmacy', 'Lab', 'Billing']
  },
  POLICE: {
    id: 'police',
    name: 'Law Enforcement',
    icon: 'shield',
    color: '#0891b2',
    compliance: ['CCTNS', 'IPC/CrPC'],
    modules: ['FIR', 'Cases', 'Evidence', 'Warrants', 'CCTNS']
  },
  GOVERNMENT: {
    id: 'government',
    name: 'Government',
    icon: 'building',
    color: '#7c3aed',
    compliance: ['RTI', 'SOC2'],
    modules: ['eOffice', 'Files', 'Citizens', 'Policies', 'RTI']
  },
  COLLEGE: {
    id: 'college',
    name: 'Education',
    icon: 'academic',
    color: '#ea580c',
    compliance: ['UGC', 'AICTE', 'NAAC'],
    modules: ['Students', 'Faculty', 'Courses', 'Exams', 'Library']
  },
  HOTEL: {
    id: 'hotel',
    name: 'Hotel & Hospitality',
    icon: 'hotel',
    color: '#16a34a',
    compliance: ['Tourism Dept', 'GST'],
    modules: ['Bookings', 'Guests', 'Rooms', 'Billing', 'Inventory']
  },
  RETAIL: {
    id: 'retail',
    name: 'Retail & Business',
    icon: 'store',
    color: '#ca8a04',
    compliance: ['GST', 'FSSAI'],
    modules: ['Inventory', 'Sales', 'Customers', 'Billing', 'Reports']
  }
};

export const getIndustryConfig = (industryId) => {
  return INDUSTRIES[industryId.toUpperCase()] || INDUSTRIES.BANK;
};
