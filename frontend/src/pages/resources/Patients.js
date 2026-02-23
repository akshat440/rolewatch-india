import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { theme } from '../../theme';

function Patients() {
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { id: 'PAT001', name: 'Rajesh Kumar', age: 45, condition: 'Diabetes', status: 'active', lastVisit: '2026-02-22' },
    { id: 'PAT002', name: 'Sunita Devi', age: 62, condition: 'Hypertension', status: 'active', lastVisit: '2026-02-21' },
    { id: 'PAT003', name: 'Vikram Singh', age: 38, condition: 'Asthma', status: 'inactive', lastVisit: '2026-01-15' },
    { id: 'PAT004', name: 'Meera Sharma', age: 29, condition: 'Pregnancy', status: 'active', lastVisit: '2026-02-22' }
  ];

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <Alert variant="success" title="Patient Records Access" style={{ marginBottom: '24px' }}>
        You have access to view patient information. All access is HIPAA compliant and logged.
      </Alert>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>
          Patient Records
        </h1>

        <input
          type="text"
          placeholder="Search patients by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: '15px',
            border: '2px solid ' + theme.colors.gray[200],
            borderRadius: theme.borderRadius.lg,
            outline: 'none'
          }}
        />
      </div>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: theme.colors.gray[50] }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>PATIENT ID</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>NAME</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>AGE</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>CONDITION</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>STATUS</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>LAST VISIT</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id} style={{ borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: '600' }}>{patient.id}</td>
                <td style={{ padding: '16px', fontWeight: '600' }}>{patient.name}</td>
                <td style={{ padding: '16px' }}>{patient.age}</td>
                <td style={{ padding: '16px' }}>{patient.condition}</td>
                <td style={{ padding: '16px' }}>
                  <Badge variant={patient.status === 'active' ? 'success' : 'default'}>
                    {patient.status}
                  </Badge>
                </td>
                <td style={{ padding: '16px', color: theme.colors.gray[600] }}>{patient.lastVisit}</td>
                <td style={{ padding: '16px' }}>
                  <Button variant="outline" size="sm">View Records</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default Patients;
