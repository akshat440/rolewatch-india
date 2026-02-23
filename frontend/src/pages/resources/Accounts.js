import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { theme } from '../../theme';
import Icon from '../../components/common/Icon';

function Accounts() {
  const [selectedAccount, setSelectedAccount] = useState(null);

  const accounts = [
    { id: 'ACC001', name: 'Rahul Sharma', type: 'Savings', balance: '₹2,45,678', status: 'active' },
    { id: 'ACC002', name: 'Priya Patel', type: 'Current', balance: '₹5,67,890', status: 'active' },
    { id: 'ACC003', name: 'Amit Kumar', type: 'Savings', balance: '₹1,23,456', status: 'frozen' },
    { id: 'ACC004', name: 'Neha Singh', type: 'Current', balance: '₹8,90,123', status: 'active' }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <Alert variant="success" title="Access Granted" style={{ marginBottom: '24px' }}>
        You have successfully accessed the Account Management system. All actions are logged and monitored.
      </Alert>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          Account Management
        </h1>
        <p style={{ color: theme.colors.gray[600] }}>
          View and manage customer accounts • {accounts.length} accounts
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAccount ? '1fr 400px' : '1fr', gap: '24px' }}>
        <div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {accounts.map(account => (
              <Card key={account.id} hover onClick={() => setSelectedAccount(account)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: theme.gradients.primary,
                    borderRadius: theme.borderRadius.xl,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    {account.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                        {account.name}
                      </h3>
                      <Badge variant={account.status === 'active' ? 'success' : 'warning'}>
                        {account.status}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '13px', color: theme.colors.gray[600] }}>
                      {account.id} • {account.type} Account
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: theme.colors.primary }}>
                      {account.balance}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.colors.gray[500] }}>
                      Current Balance
                    </div>
                  </div>

                  <Icon name="chart" size={20} style={{ color: theme.colors.gray[400] }} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {selectedAccount && (
          <Card style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>View detailed information</CardDescription>
            </CardHeader>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
                {selectedAccount.balance}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.gray[600] }}>
                Available Balance
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <span style={{ color: theme.colors.gray[600] }}>Account Number</span>
                <span style={{ fontWeight: '600' }}>{selectedAccount.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <span style={{ color: theme.colors.gray[600] }}>Account Type</span>
                <span style={{ fontWeight: '600' }}>{selectedAccount.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <span style={{ color: theme.colors.gray[600] }}>Status</span>
                <Badge variant={selectedAccount.status === 'active' ? 'success' : 'warning'}>
                  {selectedAccount.status}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <Button variant="primary" icon="chart" fullWidth>
                View Transactions
              </Button>
              <Button variant="outline" icon="dashboard" fullWidth>
                Account Statement
              </Button>
              <Button variant="ghost" icon="user" fullWidth>
                Customer Profile
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Accounts;
