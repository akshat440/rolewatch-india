import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { theme } from '../../theme';

function Transactions() {
  const [filter, setFilter] = useState('all');

  const transactions = [
    { id: 'TXN001', type: 'credit', amount: '₹25,000', account: 'Rahul Sharma', date: '2026-02-22 10:30', status: 'completed' },
    { id: 'TXN002', type: 'debit', amount: '₹12,500', account: 'Priya Patel', date: '2026-02-22 09:15', status: 'completed' },
    { id: 'TXN003', type: 'credit', amount: '₹50,000', account: 'Amit Kumar', date: '2026-02-22 08:45', status: 'pending' },
    { id: 'TXN004', type: 'debit', amount: '₹8,750', account: 'Neha Singh', date: '2026-02-21 16:20', status: 'completed' }
  ];

  const filteredTransactions = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <Alert variant="success" title="Transaction Access Granted" style={{ marginBottom: '24px' }}>
        You can now view and process transactions. All activities are logged to blockchain.
      </Alert>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
            Transaction Processing
          </h1>
          <p style={{ color: theme.colors.gray[600] }}>
            Real-time transaction monitoring and processing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({transactions.length})
          </Button>
          <Button 
            variant={filter === 'credit' ? 'success' : 'ghost'}
            size="sm"
            onClick={() => setFilter('credit')}
          >
            Credits
          </Button>
          <Button 
            variant={filter === 'debit' ? 'danger' : 'ghost'}
            size="sm"
            onClick={() => setFilter('debit')}
          >
            Debits
          </Button>
        </div>
      </div>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: theme.colors.gray[50] }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>ID</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>TYPE</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>AMOUNT</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>ACCOUNT</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>DATE</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>STATUS</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(txn => (
              <tr key={txn.id} style={{ borderBottom: '1px solid ' + theme.colors.gray[200] }}>
                <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: '600' }}>{txn.id}</td>
                <td style={{ padding: '16px' }}>
                  <Badge variant={txn.type === 'credit' ? 'success' : 'danger'}>
                    {txn.type.toUpperCase()}
                  </Badge>
                </td>
                <td style={{ padding: '16px', fontSize: '16px', fontWeight: '700' }}>{txn.amount}</td>
                <td style={{ padding: '16px' }}>{txn.account}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: theme.colors.gray[600] }}>{txn.date}</td>
                <td style={{ padding: '16px' }}>
                  <Badge variant={txn.status === 'completed' ? 'success' : 'warning'}>
                    {txn.status}
                  </Badge>
                </td>
                <td style={{ padding: '16px' }}>
                  <Button variant="outline" size="sm">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default Transactions;
