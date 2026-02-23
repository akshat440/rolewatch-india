import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Accounts from './resources/Accounts';
import Transactions from './resources/Transactions';
import Loans from './resources/Loans';
import Patients from './resources/Patients';
import { Button } from '../components/ui/Button';

function ResourceDetail() {
  const { resourceKey } = useParams();
  const navigate = useNavigate();

  const resourceComponents = {
    accounts: Accounts,
    transactions: Transactions,
    loans: Loans,
    patients: Patients
  };

  const ResourceComponent = resourceComponents[resourceKey];

  if (!ResourceComponent) {
    return (
      <div style={{ padding: '32px' }}>
        <Button onClick={() => navigate('/resources')} icon="chart">
          Back to Resources
        </Button>
        <h1>Resource: {resourceKey}</h1>
        <p>This resource page is under development.</p>
      </div>
    );
  }

  return <ResourceComponent />;
}

export default ResourceDetail;
