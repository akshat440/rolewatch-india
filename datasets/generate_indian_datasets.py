"""
RoleWatch - Indian Dataset Generator
Generates realistic Indian data for all 5 industries
"""

import json
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

random.seed(42)
np.random.seed(42)

# Indian-specific data
INDIAN_FIRST_NAMES = [
    'Anushka', 'Akshat', 'Vidhi', 'Rajesh', 'Priya', 'Amit', 'Neha', 'Rahul',
    'Sneha', 'Arjun', 'Pooja', 'Vikram', 'Anjali', 'Rohan', 'Kavya', 'Aditya',
    'Divya', 'Karan', 'Riya', 'Sanjay', 'Meera', 'Varun', 'Shreya', 'Nikhil',
    'Tanvi', 'Gaurav', 'Isha', 'Manish', 'Sakshi', 'Abhinav', 'Nandini', 'Harsh',
    'Kritika', 'Siddharth', 'Ananya', 'Aakash', 'Simran', 'Kunal', 'Preeti', 'Mohit'
]

INDIAN_LAST_NAMES = [
    'Pareek', 'Tomar', 'Luniya', 'Kumar', 'Sharma', 'Singh', 'Verma', 'Gupta',
    'Agarwal', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Mehta', 'Joshi', 'Desai',
    'Pillai', 'Rao', 'Malhotra', 'Kapoor', 'Chopra', 'Bhatia', 'Khanna', 'Sethi',
    'Bansal', 'Mittal', 'Jain', 'Shah', 'Gandhi', 'Naidu', 'Menon', 'Kulkarni'
]

INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
    'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
    'Bhopal', 'Visakhapatnam', 'Vadodara', 'Kochi', 'Coimbatore', 'Chandigarh'
]

# Indian IP ranges (simplified)
INDIAN_IP_PREFIXES = ['103.', '117.', '123.', '1.', '27.', '49.', '106.', '115.']

def generate_indian_email(first_name, last_name):
    """Generate realistic Indian email"""
    domains = ['gmail.com', 'yahoo.in', 'outlook.com', 'rediffmail.com', 'hotmail.com']
    username = f"{first_name.lower()}.{last_name.lower()}"
    return f"{username}@{random.choice(domains)}"

def generate_indian_phone():
    """Generate Indian phone number"""
    operators = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90']
    return f"+91 {random.choice(operators)}{random.randint(10000000, 99999999)}"

def generate_indian_ip():
    """Generate Indian IP address"""
    prefix = random.choice(INDIAN_IP_PREFIXES)
    return f"{prefix}{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

# ===== INDIAN BANKING DATASET =====
def generate_indian_bank_dataset(n_users=100, n_transactions=5000):
    """Generate Indian banking dataset (RBI compliant)"""
    
    banks = ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'PNB', 'Bank of Baroda']
    departments = ['Retail Banking', 'Corporate Banking', 'Treasury', 'Risk & Compliance', 'IT Security', 'Operations']
    roles = ['Teller', 'Branch Manager', 'Loan Officer', 'Relationship Manager', 'Credit Analyst', 'Compliance Officer', 'IT Admin']
    
    users = []
    for i in range(n_users):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        
        user = {
            'user_id': f'BANK{i+1:04d}',
            'email': generate_indian_email(first_name, last_name),
            'first_name': first_name,
            'last_name': last_name,
            'phone': generate_indian_phone(),
            'department': random.choice(departments),
            'role': random.choice(roles),
            'employee_id': f'EMP{random.randint(10000, 99999)}',
            'branch_code': f'{random.choice(banks[:3])}{random.randint(100, 999)}',
            'branch_location': random.choice(INDIAN_CITIES),
            'rbi_certified': random.choice([True, True, False]),
            'aadhar_linked': True,
            'pan_verified': True,
            'mfa_enabled': random.choice([True, True, True, False]),
            'join_date': (datetime.now() - timedelta(days=random.randint(30, 1825))).isoformat(),
            'last_training_date': (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat()
        }
        users.append(user)
    
    # Generate access logs
    logs = []
    for _ in range(n_transactions):
        user = random.choice(users)
        action = random.choice([
            'view_account', 'transfer_funds', 'approve_loan', 'neft_transfer',
            'rtgs_transfer', 'upi_transaction', 'kyc_verification', 'generate_report'
        ])
        
        log = {
            'timestamp': (datetime.now() - timedelta(
                days=random.randint(0, 90),
                hours=random.randint(9, 18),  # Working hours
                minutes=random.randint(0, 59)
            )).isoformat(),
            'user_id': user['user_id'],
            'action': action,
            'resource': random.choice(['customer_accounts', 'transactions', 'loans', 'kyc_documents', 'reports']),
            'ip_address': generate_indian_ip(),
            'location': random.choice(INDIAN_CITIES),
            'device': random.choice(['Windows/Chrome', 'MacOS/Safari', 'Android/Chrome', 'iOS/Safari']),
            'status': random.choices(['success', 'denied', 'failed'], weights=[0.85, 0.10, 0.05])[0],
            'amount_inr': random.randint(1000, 1000000) if 'transfer' in action else None,
            'transaction_type': random.choice(['NEFT', 'RTGS', 'IMPS', 'UPI']) if 'transfer' in action else None,
            'risk_score': random.randint(0, 100)
        }
        logs.append(log)
    
    return {'users': users, 'logs': logs}

# ===== INDIAN HOSPITAL DATASET =====
def generate_indian_hospital_dataset(n_users=150, n_accesses=8000):
    """Generate Indian healthcare dataset (DPDP Act 2023 compliant)"""
    
    departments = ['Emergency', 'Surgery', 'Pediatrics', 'Cardiology', 'Radiology', 'Pharmacy', 'ICU', 'OPD']
    roles = ['Doctor', 'Nurse', 'Surgeon', 'Radiologist', 'Pharmacist', 'Medical Officer', 'Staff Nurse']
    hospitals = ['AIIMS', 'Apollo', 'Fortis', 'Max Healthcare', 'Manipal', 'Govt Hospital']
    
    users = []
    for i in range(n_users):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        
        user = {
            'user_id': f'MED{i+1:04d}',
            'email': generate_indian_email(first_name, last_name),
            'first_name': first_name,
            'last_name': last_name,
            'phone': generate_indian_phone(),
            'department': random.choice(departments),
            'role': random.choice(roles),
            'medical_council_reg': f'MCI{random.randint(100000, 999999)}',
            'hospital': random.choice(hospitals),
            'hospital_location': random.choice(INDIAN_CITIES),
            'specialization': random.choice(['General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Surgery']),
            'nabh_trained': random.choice([True, True, False]),
            'ayushman_bharat_certified': random.choice([True, False]),
            'shift': random.choice(['Morning', 'Evening', 'Night', 'Rotating']),
            'join_date': (datetime.now() - timedelta(days=random.randint(30, 3650))).isoformat()
        }
        users.append(user)
    
    # Generate patient access logs
    logs = []
    for _ in range(n_accesses):
        user = random.choice(users)
        action = random.choice([
            'view_patient_record', 'update_diagnosis', 'prescribe_medication',
            'view_lab_results', 'emergency_access', 'discharge_patient', 'ayushman_verify'
        ])
        
        log = {
            'timestamp': (datetime.now() - timedelta(
                days=random.randint(0, 60),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )).isoformat(),
            'user_id': user['user_id'],
            'action': action,
            'patient_uhid': f'UHID{random.randint(100000, 999999)}',
            'patient_aadhar': f'{random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}',
            'resource': random.choice(['patient_records', 'lab_results', 'prescriptions', 'imaging', 'billing']),
            'sensitive_data_accessed': True,
            'justification': random.choice(['Treatment', 'Emergency', 'Consultation', 'Follow-up']),
            'ip_address': generate_indian_ip(),
            'location': random.choice(INDIAN_CITIES),
            'device': random.choice(['Hospital Workstation', 'Tablet', 'Mobile']),
            'status': random.choices(['success', 'denied'], weights=[0.90, 0.10])[0],
            'risk_score': random.randint(0, 100)
        }
        logs.append(log)
    
    return {'users': users, 'logs': logs}

# ===== INDIAN POLICE DATASET =====
def generate_indian_police_dataset(n_users=80, n_operations=4000):
    """Generate Indian police dataset (IPC/CrPC compliant)"""
    
    departments = ['Crime Branch', 'Traffic Police', 'Cyber Crime', 'Special Branch', 'Forensics', 'Control Room']
    ranks = ['Constable', 'Head Constable', 'Sub-Inspector', 'Inspector', 'ACP', 'DCP', 'Superintendent']
    police_stations = ['Mumbai Police', 'Delhi Police', 'Bangalore Police', 'Hyderabad Police', 'Chennai Police']
    
    users = []
    for i in range(n_users):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        
        user = {
            'user_id': f'POL{i+1:04d}',
            'email': generate_indian_email(first_name, last_name),
            'first_name': first_name,
            'last_name': last_name,
            'phone': generate_indian_phone(),
            'police_id': f'PID{random.randint(10000, 99999)}',
            'rank': random.choice(ranks),
            'department': random.choice(departments),
            'station': random.choice(police_stations),
            'station_location': random.choice(INDIAN_CITIES),
            'state_cadre': random.choice(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana']),
            'weapon_authorized': random.choice([True, False]),
            'cctns_access': True,  # Crime and Criminal Tracking Network System
            'icjs_certified': random.choice([True, False]),  # Interoperable Criminal Justice System
            'years_of_service': random.randint(1, 30),
            'join_date': (datetime.now() - timedelta(days=random.randint(365, 10950))).isoformat()
        }
        users.append(user)
    
    # Generate case access logs
    logs = []
    for _ in range(n_operations):
        user = random.choice(users)
        action = random.choice([
            'view_fir', 'update_case_status', 'access_evidence', 'run_criminal_check',
            'issue_warrant', 'close_case', 'cctns_search', 'nafis_search'
        ])
        
        log = {
            'timestamp': (datetime.now() - timedelta(
                days=random.randint(0, 180),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )).isoformat(),
            'user_id': user['user_id'],
            'action': action,
            'fir_number': f'FIR/{random.randint(1, 999)}/{random.randint(2024, 2026)}',
            'case_type': random.choice(['IPC Section 420', 'IPC Section 302', 'IT Act', 'NDPS Act', 'Traffic Violation']),
            'resource': random.choice(['fir_records', 'evidence_locker', 'cctns_database', 'nafis_records', 'warrants']),
            'classification': random.choice(['Public', 'Restricted', 'Confidential']),
            'ip_address': generate_indian_ip(),
            'location': random.choice(INDIAN_CITIES),
            'device': random.choice(['Police Terminal', 'Mobile Device', 'Vehicle MDT']),
            'status': random.choices(['success', 'denied'], weights=[0.85, 0.15])[0],
            'risk_score': random.randint(0, 100)
        }
        logs.append(log)
    
    return {'users': users, 'logs': logs}

# ===== INDIAN GOVERNMENT DATASET =====
def generate_indian_government_dataset(n_users=120, n_activities=6000):
    """Generate Indian government dataset (RTI Act compliant)"""
    
    ministries = ['Finance', 'Home Affairs', 'Education', 'Health', 'IT & Electronics', 'Rural Development']
    grades = ['Group A', 'Group B', 'Group C', 'Group D']
    cadres = ['IAS', 'IPS', 'IFS', 'Central Services', 'State Services']
    
    users = []
    for i in range(n_users):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        
        user = {
            'user_id': f'GOV{i+1:04d}',
            'email': generate_indian_email(first_name, last_name) if random.random() > 0.3 else f"{first_name.lower()}.{last_name.lower()}@gov.in",
            'first_name': first_name,
            'last_name': last_name,
            'phone': generate_indian_phone(),
            'ministry': random.choice(ministries),
            'grade': random.choice(grades),
            'cadre': random.choice(cadres) if random.random() > 0.5 else 'Central Services',
            'designation': random.choice(['Under Secretary', 'Deputy Secretary', 'Joint Secretary', 'Director', 'Additional Secretary']),
            'office_location': random.choice(['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Kolkata']),
            'digidocker_id': f'DD{random.randint(100000, 999999)}',
            'rti_officer': random.choice([True, False]),
            'meity_certified': random.choice([True, False]),
            'join_date': (datetime.now() - timedelta(days=random.randint(365, 7300))).isoformat()
        }
        users.append(user)
    
    # Generate access logs
    logs = []
    for _ in range(n_activities):
        user = random.choice(users)
        action = random.choice([
            'view_file', 'create_noting', 'approve_proposal', 'access_eoffice',
            'rtionline_response', 'digidocker_search', 'parivahan_access'
        ])
        
        log = {
            'timestamp': (datetime.now() - timedelta(
                days=random.randint(0, 120),
                hours=random.randint(9, 18),
                minutes=random.randint(0, 59)
            )).isoformat(),
            'user_id': user['user_id'],
            'action': action,
            'file_number': f'{random.randint(1, 999)}/F.No/{random.randint(1, 50)}/{random.randint(2024, 2026)}',
            'resource': random.choice(['eoffice', 'digidocker', 'citizen_database', 'financial_records', 'rti_portal']),
            'classification': random.choice(['Unclassified', 'Restricted', 'Confidential', 'Secret']),
            'rti_applicable': random.choice([True, False]),
            'ip_address': generate_indian_ip(),
            'location': random.choice(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']),
            'device': random.choice(['Government Workstation', 'NIC Laptop', 'Mobile']),
            'status': random.choices(['success', 'denied'], weights=[0.88, 0.12])[0],
            'risk_score': random.randint(0, 100)
        }
        logs.append(log)
    
    return {'users': users, 'logs': logs}

# ===== INDIAN COLLEGE DATASET =====
def generate_indian_college_dataset(n_users=200, n_activities=10000):
    """Generate Indian education dataset (UGC/AICTE compliant)"""
    
    universities = ['IIT', 'NIT', 'IIIT', 'State University', 'Deemed University', 'Private University']
    departments = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Commerce', 'Arts', 'Science', 'Management']
    roles = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant', 'Admin Staff', 'HOD']
    
    users = []
    for i in range(n_users):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        
        user = {
            'user_id': f'EDU{i+1:04d}',
            'email': generate_indian_email(first_name, last_name) if random.random() > 0.4 else f"{first_name.lower()}.{last_name.lower()}@{random.choice(['iit', 'nit', 'university'])}.ac.in",
            'first_name': first_name,
            'last_name': last_name,
            'phone': generate_indian_phone(),
            'department': random.choice(departments),
            'role': random.choice(roles),
            'employee_code': f'FAC{random.randint(1000, 9999)}',
            'university': random.choice(universities),
            'campus_location': random.choice(INDIAN_CITIES),
            'ugc_net_qualified': random.choice([True, True, False]),
            'phd': random.choice([True, False]),
            'aicte_approved': random.choice([True, False]),
            'naac_grading': random.choice(['A++', 'A+', 'A', 'B++', 'B+']),
            'courses_taught': random.randint(1, 5),
            'join_date': (datetime.now() - timedelta(days=random.randint(365, 5475))).isoformat()
        }
        users.append(user)
    
    # Generate academic records access
    logs = []
    for _ in range(n_activities):
        user = random.choice(users)
        action = random.choice([
            'view_student_record', 'enter_marks', 'generate_marksheet', 'access_transcript',
            'update_attendance', 'approve_exam_form', 'digilocker_verify'
        ])
        
        log = {
            'timestamp': (datetime.now() - timedelta(
                days=random.randint(0, 90),
                hours=random.randint(9, 18),
                minutes=random.randint(0, 59)
            )).isoformat(),
            'user_id': user['user_id'],
            'action': action,
            'student_enrollment': f'{random.randint(2020, 2026)}{random.choice(["CS", "EC", "ME", "CE"])}{random.randint(100, 999)}',
            'resource': random.choice(['student_records', 'marks_entry', 'transcripts', 'digilocker', 'attendance']),
            'semester': random.choice(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
            'academic_year': f'{random.randint(2023, 2026)}-{random.randint(2024, 2027)}',
            'ip_address': generate_indian_ip(),
            'location': random.choice(INDIAN_CITIES),
            'device': random.choice(['Faculty Workstation', 'Personal Laptop', 'Mobile']),
            'status': random.choices(['success', 'denied'], weights=[0.92, 0.08])[0],
            'risk_score': random.randint(0, 100)
        }
        logs.append(log)
    
    return {'users': users, 'logs': logs}

# ===== MAIN GENERATION =====
def generate_all_indian_datasets():
    """Generate all Indian datasets"""
    
    print("🇮🇳 RoleWatch - INDIAN Dataset Generator")
    print("=" * 70)
    
    datasets = {
        'indian_bank': generate_indian_bank_dataset(),
        'indian_hospital': generate_indian_hospital_dataset(),
        'indian_police': generate_indian_police_dataset(),
        'indian_government': generate_indian_government_dataset(),
        'indian_college': generate_indian_college_dataset()
    }
    
    # Save files
    for industry, data in datasets.items():
        # JSON files
        with open(f'{industry}_users.json', 'w', encoding='utf-8') as f:
            json.dump(data['users'], f, indent=2, ensure_ascii=False)
        
        with open(f'{industry}_logs.json', 'w', encoding='utf-8') as f:
            json.dump(data['logs'], f, indent=2, ensure_ascii=False)
        
        # CSV files
        pd.DataFrame(data['users']).to_csv(f'{industry}_users.csv', index=False, encoding='utf-8')
        pd.DataFrame(data['logs']).to_csv(f'{industry}_logs.csv', index=False, encoding='utf-8')
        
        print(f"✅ {industry.upper()}: {len(data['users'])} users, {len(data['logs'])} logs")
    
    # Summary
    summary = {
        'generated_at': datetime.now().isoformat(),
        'total_users': sum(len(d['users']) for d in datasets.values()),
        'total_logs': sum(len(d['logs']) for d in datasets.values()),
        'industries': list(datasets.keys()),
        'country': 'India',
        'compliance': ['DPDP Act 2023', 'RBI Guidelines', 'MEITY Standards', 'UGC Norms', 'IPC/CrPC']
    }
    
    with open('indian_dataset_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print("=" * 70)
    print(f"📊 TOTAL: {summary['total_users']} Indian users, {summary['total_logs']} logs")
    print("✨ All Indian datasets generated successfully!")
    print("\n🇮🇳 Indian-Specific Features:")
    print("   - Indian names, cities, and phone numbers")
    print("   - RBI, NABH, CCTNS, RTI compliance")
    print("   - Aadhar, PAN, UPI integration")
    print("   - IPC/CrPC, DPDP Act references")

if __name__ == '__main__':
    generate_all_indian_datasets()
