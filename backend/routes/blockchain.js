const express = require('express');
const router = express.Router();
const blockchain = require('../services/blockchain/blockchainService');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Log a critical event to blockchain
router.post('/log-event', async (req, res) => {
  try {
    const { eventType, data } = req.body;
    const userId = req.user.id;

    const block = blockchain.logEvent(eventType, userId, data);

    console.log(`📦 Blockchain: New block added - ${eventType}`);

    res.json({
      success: true,
      message: 'Event logged to blockchain',
      block: {
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
        nonce: block.nonce
      }
    });
  } catch (error) {
    console.error('Blockchain error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging to blockchain'
    });
  }
});

// Verify blockchain integrity
router.get('/verify', (req, res) => {
  const isValid = blockchain.isChainValid();
  
  res.json({
    success: true,
    isValid,
    message: isValid ? 'Blockchain is valid' : 'Blockchain has been tampered with!'
  });
});

// Get all blocks
router.get('/blocks', (req, res) => {
  const { limit = 50, eventType, userId } = req.query;

  let blocks = blockchain.chain;

  if (eventType) {
    blocks = blockchain.getBlocksByEventType(eventType);
  }

  if (userId) {
    blocks = blockchain.getBlocksByUser(userId);
  }

  // Reverse to show latest first
  blocks = blocks.slice().reverse().slice(0, parseInt(limit));

  res.json({
    success: true,
    blocks: blocks.map(block => ({
      index: block.index,
      hash: block.hash,
      previousHash: block.previousHash,
      timestamp: block.timestamp,
      data: block.data,
      nonce: block.nonce
    })),
    total: blockchain.chain.length
  });
});

// Get specific block
router.get('/blocks/:index', (req, res) => {
  const { index } = req.params;
  const block = blockchain.getBlock(parseInt(index));

  if (!block) {
    return res.status(404).json({
      success: false,
      message: 'Block not found'
    });
  }

  res.json({
    success: true,
    block: {
      index: block.index,
      hash: block.hash,
      previousHash: block.previousHash,
      timestamp: block.timestamp,
      data: block.data,
      nonce: block.nonce
    }
  });
});

// Get blockchain statistics
router.get('/stats', (req, res) => {
  const stats = blockchain.getChainStats();

  res.json({
    success: true,
    stats: {
      totalBlocks: stats.totalBlocks,
      isValid: stats.isValid,
      difficulty: stats.difficulty,
      latestBlock: {
        index: stats.latestBlock.index,
        hash: stats.latestBlock.hash,
        timestamp: stats.latestBlock.timestamp
      },
      genesisBlock: {
        index: stats.genesisBlock.index,
        hash: stats.genesisBlock.hash,
        timestamp: stats.genesisBlock.timestamp
      }
    }
  });
});

module.exports = router;
