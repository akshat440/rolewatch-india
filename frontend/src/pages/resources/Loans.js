import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { theme } from '../../theme';

function Loans() {
  const [selectedLoan, setSelectedLoan] = useState(null);

  const loans = [
    { id: 'LOAN001', applicant: 'Rahul Sharma', type: 'Home Loan', amount: '₹50,00,000', status: 'pending', applied: '2026-02-20' },
    { id: 'LOAN002', applicant: 'Priya Patel', type: 'Personal Loan', amount: '₹5,00,000', status: 'approved', applied: '2026-02-18' },
    { id: 'LOAN003', applicant: 'Amit Kumar', type: 'Business Loan', amount: '₹25,00,000', status: 'under_review', applied: '2026-02-19' },
    { id: 'LOAN004', applicant: 'Neha Singh', type: 'Car Loan', amount: '₹8,00,000', status: 'rejected', applied: '2026-02-17' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <Alert variant="success" title="Loan Management Access" style={{ marginBottom: '24px' }}>
        You have access to review and process loan applications.
      </Alert>

      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>
        Loan Management System
      </h1>

      <div style={{ display: 'grid', gap: '16px' }}>
        {loans.map(loan => (
          <Card key={loan.id} hover onClick={() => setSelectedLoan(loan)}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                    {loan.applicant}
                  </h3>
                  <Badge variant={getStatusColor(loan.status)}>
                    {loan.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div style={{ fontSize: '13px', color: theme.colors.gray[600] }}>
                  {loan.id} • {loan.type}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: theme.colors.primary }}>
                  {loan.amount}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.gray[500] }}>
                  Applied: {loan.applied}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Card style={{ maxWidth: '600px', width: '90%' }}>
            <CardHeader>
              <CardTitle>Loan Application Details</CardTitle>
            </CardHeader>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
                {selectedLoan.amount}
              </div>
              <div style={{ fontSize: '15px', color: theme.colors.gray[600] }}>
                {selectedLoan.type}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <span>Application ID</span>
                <span style={{ fontWeight: '600' }}>{selectedLoan.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <span>Applicant</span>
                <span style={{ fontWeight: '600' }}>{selectedLoan.applicant}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <span>Status</span>
                <Badge variant={getStatusColor(selectedLoan.status)}>
                  {selectedLoan.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedLoan.status === 'pending' && (
                <>
                  <Button variant="success" fullWidth>Approve Loan</Button>
                  <Button variant="danger" fullWidth>Reject Loan</Button>
                </>
              )}
              <Button variant="ghost" fullWidth onClick={() => setSelectedLoan(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Loans;
