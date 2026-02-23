import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../components/common/Icon';
import { getUserSession } from '../services/sessionManager';

function Blockchain() {
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const session = getUserSession();

  useEffect(() => {
    loadBlockchain();
  }, []);

  const loadBlockchain = async () => {
    try {
      const token = session?.token;

      const [blocksRes, statsRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/blockchain/blocks`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/blockchain/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      setBlocks(blocksRes.data.blocks);
      setStats(statsRes.data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading blockchain:', error);
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    setVerifying(true);
    
    try {
      const token = session?.token;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/blockchain/verify`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVerificationResult(response.data);
      
      setTimeout(() => setVerificationResult(null), 5000);
    } catch (error) {
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const getEventColor = (event) => {
    const colors = {
      'USER_LOGIN': '#3b82f6',
      'PERMISSION_CHANGE': '#f59e0b',
      'ACCESS_DENIED': '#ef4444',
      'SENSITIVE_ACCESS': '#8b5cf6',
      'GENESIS_BLOCK': '#10b981'
    };
    return colors[event] || '#6b7280';
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading blockchain...</div>;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Verification Result */}
      {verificationResult && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: verificationResult.isValid ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 9999,
          animation: 'slideIn 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon name={verificationResult.isValid ? 'user' : 'alert'} size={24} />
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                {verificationResult.isValid ? 'Blockchain Valid' : 'Blockchain Tampered!'}
              </div>
              <div style={{ fontSize: '13px' }}>
                {verificationResult.message}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            Blockchain Explorer
          </h1>
          <p style={{ color: '#6b7280' }}>
            Immutable audit trail with cryptographic verification
          </p>
        </div>
        <button
          onClick={verifyChain}
          disabled={verifying}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Icon name="shield" size={18} />
          {verifying ? 'Verifying...' : 'Verify Chain'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#667eea', marginBottom: '8px' }}>
              {stats.totalBlocks}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
              Total Blocks
            </div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              color: stats.isValid ? '#10b981' : '#ef4444',
              marginBottom: '8px'
            }}>
              {stats.isValid ? '✓' : '✗'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
              Chain Status
            </div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>
              {stats.difficulty}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
              Mining Difficulty
            </div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px', fontFamily: 'monospace' }}>
              {stats.latestBlock.hash.substring(0, 8)}...
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
              Latest Hash
            </div>
          </div>
        </div>
      )}

      {/* Blocks */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {blocks.map(block => (
          <div
            key={block.index}
            onClick={() => setSelectedBlock(selectedBlock?.index === block.index ? null : block)}
            style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = getEventColor(block.data.event);
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${getEventColor(block.data.event)}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon name="lock" size={24} style={{ color: getEventColor(block.data.event) }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>
                    Block #{block.index}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    background: `${getEventColor(block.data.event)}20`,
                    color: getEventColor(block.data.event),
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {block.data.event}
                  </span>
                </div>
                
                <div style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>
                  Hash: {block.hash.substring(0, 32)}...
                </div>
                
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  {new Date(block.timestamp).toLocaleString()} • Nonce: {block.nonce}
                </div>
              </div>

              <Icon 
                name={selectedBlock?.index === block.index ? 'dashboard' : 'chart'} 
                size={20} 
                style={{ color: '#9ca3af' }} 
              />
            </div>

            {/* Expanded Details */}
            {selectedBlock?.index === block.index && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '8px',
                animation: 'slideDown 0.3s'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Complete Hash:
                  </div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px', 
                    wordBreak: 'break-all',
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {block.hash}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Previous Hash:
                  </div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px', 
                    wordBreak: 'break-all',
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {block.previousHash}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Block Data:
                  </div>
                  <pre style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px',
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    overflow: 'auto',
                    margin: 0
                  }}>
                    {JSON.stringify(block.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; maxHeight: 0; }
          to { opacity: 1; maxHeight: 1000px; }
        }
      `}</style>
    </div>
  );
}

export default Blockchain;
