const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), {
      event: 'GENESIS_BLOCK',
      message: 'RoleWatch India Blockchain Initialized'
    }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(eventData) {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      eventData,
      this.getLatestBlock().hash
    );
    
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    
    return newBlock;
  }

  logEvent(eventType, userId, data) {
    const eventData = {
      event: eventType,
      userId: userId,
      timestamp: new Date().toISOString(),
      data: data,
      metadata: {
        blockNumber: this.chain.length,
        previousHash: this.getLatestBlock().hash
      }
    };

    return this.addBlock(eventData);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlock(index) {
    return this.chain[index];
  }

  getBlocksByUser(userId) {
    return this.chain.filter(block => block.data.userId === userId);
  }

  getBlocksByEventType(eventType) {
    return this.chain.filter(block => block.data.event === eventType);
  }

  getChainStats() {
    return {
      totalBlocks: this.chain.length,
      isValid: this.isChainValid(),
      latestBlock: this.getLatestBlock(),
      difficulty: this.difficulty,
      genesisBlock: this.chain[0]
    };
  }
}

// Create singleton instance
const blockchainInstance = new Blockchain();

module.exports = blockchainInstance;
