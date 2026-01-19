# Solana Key Sharding POC

A proof-of-concept web application demonstrating secure private key management using **key sharding** on the Solana blockchain.

## 🔐 What is Key Sharding?

Key sharding is a security technique that splits a private key into multiple parts (shards). Each shard is useless on its own - they must be combined to reconstruct the full key.

### Why Use Key Sharding?

```
Traditional Storage:
[Full Private Key] → If compromised = ALL FUNDS LOST

Key Sharding:
[Shard 1] + [Shard 2] → Both must be compromised to access funds
```

**Security Benefits:**
- ✅ Eliminates single point of failure
- ✅ Compromising one location (browser OR server) is insufficient
- ✅ Reduces attack surface significantly
- ✅ Provides defense-in-depth security

## 🏗️ Architecture

### Key Distribution

```
┌─────────────────┐      ┌─────────────────┐
│    Browser      │      │    Backend      │
│                 │      │                 │
│  Shard 1 (50%)  │  +   │  Shard 2 (50%)  │
│  sessionStorage │      │  Encrypted RAM  │
└─────────────────┘      └─────────────────┘
         │                         │
         └────────────┬────────────┘
                      ↓
              [Combine Shards]
                      ↓
              [Full Private Key]
                      ↓
              [Sign Transaction]
                      ↓
              [Discard Key]
```

### Security Properties

| Component | Storage | Duration | Security |
|-----------|---------|----------|----------|
| Shard 1 | Browser sessionStorage | Until tab close | Never transmitted |
| Shard 2 | Backend RAM (encrypted) | Until server restart | Never persisted |
| Full Key | NEVER | Combined only for signing | Immediately discarded |

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- No Android Studio or mobile device needed
- Web browser (Chrome, Firefox, Safari)

### Installation

```bash
# Navigate to the POC directory
cd solana-poc

# Install backend dependencies
cd backend
npm install

# Start the backend server
npm start
```

The backend will start on `http://localhost:3001`

### Running the Frontend

Simply open `public/index.html` in your browser, or use a simple HTTP server:

```bash
# From the solana-poc directory
# Python 3
python -m http.server 8000

# Node.js (using http-server)
npx http-server -p 8000

# Then open http://localhost:8000
```

## 📖 How to Use

### 1. Generate Wallet

Click "Generate New Wallet" to create a new Solana keypair with key sharding:

- **Shard 1** is stored in your browser's sessionStorage
- **Shard 2** is encrypted and stored in backend RAM
- The **full private key is never stored anywhere**

### 2. Check Balance

Enter a wallet address (or use the generated one) and click "Check Balance" to see the SOL balance on Devnet.

### 3. Request Airdrop

Get test SOL from the Devnet faucet (up to 2 SOL per request). This is free and has no real value.

### 4. Transfer SOL

Transfer SOL to another Devnet address. The transfer uses the sharded key:

1. Frontend sends Shard 1 to backend
2. Backend combines with Shard 2
3. Backend signs transaction
4. Both shards are immediately discarded
5. Transaction is broadcast to Solana Devnet

## 🔒 Security Questions Answered

### Q1: Why not store the full private key in the backend?

**A:** Storing the full key creates a single point of failure. If the backend is breached, all wallets are compromised. With sharding, a breach only reveals encrypted shards that are useless without the browser shard.

### Q2: What happens if the server restarts?

**A:** All Shard 2 values are lost because they're stored in RAM only. Users must re-import their wallets using their original private key or seed phrase.

**In production**, you would use:
- Distributed key generation across multiple servers
- Geographic distribution of shards
- Backup and recovery mechanisms
- Hardware security modules (HSMs)

### Q3: Can the backend see my full private key?

**A:** NO. The backend:
1. Receives only Shard 2 (encrypted)
2. Never receives Shard 1
3. Combines shards only temporarily for signing
4. Immediately discards all key material

The backend never has the complete key in memory at any point.

### Q4: Is this safe for mainnet?

**A:** NO! This is a proof of concept with limitations:

**Not Production-Ready Because:**
- ❌ Simplified XOR sharding (use Shamir's Secret Sharing)
- ❌ No hardware security modules (HSMs)
- ❌ No multi-party computation (MPC)
- ❌ No geographic distribution
- ❌ No disaster recovery
- ❌ No audit logging
- ❌ Single backend server

**Production Solutions:**
- ✅ Fireblocks
- ✅ Coinbase Custody
- ✅ Anchorage
- ✅ Custom MPC + HSM implementation

### Q5: How do I recover my wallet if I lose access?

**A:** You need your original private key or seed phrase. This POC doesn't implement recovery features.

**Production Recovery Methods:**
- Social recovery (trusted guardians)
- Multi-sig wallets
- Time-locked contracts
- Backup key shares with custodians

## 🧪 Testing the POC

### Test Scenario 1: Key Sharding Verification

1. Generate a wallet
2. Check browser DevTools → Application → Session Storage
3. You'll see `shard1` (partial key)
4. This shard alone cannot sign transactions
5. Backend has `shard2` (encrypted)
6. Only together can they sign

### Test Scenario 2: Server Restart

1. Generate a wallet and note the address
2. Restart the backend server (Ctrl+C, then `npm start`)
3. Try to transfer SOL
4. You'll get an error: "Shard 2 not found"
5. This proves shards are not persisted to disk

### Test Scenario 3: Tab Close

1. Generate a wallet
2. Close the browser tab
3. Reopen the page
4. Shard 1 is gone (cleared from sessionStorage)
5. You must generate/import a new wallet

## 📁 Project Structure

```
solana-poc/
├── SECURITY.md          # Detailed security architecture
├── README.md            # This file
├── backend/
│   ├── server.js        # Express server with key sharding
│   └── package.json     # Backend dependencies
└── public/
    ├── index.html       # Frontend interface
    ├── css/
    │   └── style.css    # Styling
    └── js/
        └── app.js        # Frontend logic
```

## 🔧 API Endpoints

### POST /api/store-shard
Store encrypted Shard 2 in backend memory

```json
{
  "walletId": "wallet_1234567890_abc123",
  "shard2": "1a2b3c4d..."
}
```

### POST /api/get-balance
Get SOL balance for an address

```json
{
  "publicKey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
}
```

### POST /api/request-airdrop
Request SOL from Devnet faucet

```json
{
  "publicKey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
}
```

### POST /api/transfer
Transfer SOL using sharded key

```json
{
  "walletId": "wallet_1234567890_abc123",
  "shard1": "5e6f7a8b...",
  "toAddress": "destWalletAddress...",
  "amount": 0.1
}
```

### DELETE /api/clear-shard
Clear Shard 2 from backend memory

```json
{
  "walletId": "wallet_1234567890_abc123"
}
```

### GET /api/health
Health check and server status

### GET /api/security-info
Security architecture details

## 🛡️ Security Best Practices (For Production)

### 1. Use Proper Secret Sharing
```javascript
// ❌ This POC: Simple XOR
shard2[i] = privateKey[i] ^ shard1[i];

// ✅ Production: Shamir's Secret Sharing
const shards = shamir.split(2, 3, privateKey); // 2-of-3 threshold
```

### 2. Hardware Security Modules
```javascript
// Store keys in HSM, not software
const hsm = new HardwareSecurityModule();
const signature = await hsm.sign(transaction);
```

### 3. Multi-Party Computation (MPC)
```javascript
// Distributed signing without reconstructing key
const partialSig1 = party1.sign(transaction);
const partialSig2 = party2.sign(transaction);
const fullSig = combine(partialSig1, partialSig2);
```

### 4. Geographic Distribution
```
Server 1 (US East)    → Shard 2a
Server 2 (EU West)    → Shard 2b
Server 3 (Asia Pacific)→ Shard 2c

Requires 2 of 3 to reconstruct
```

### 5. Comprehensive Audit Logging
```javascript
log({
  event: 'SHARD_COMBINE',
  walletId: 'xxx',
  timestamp: Date.now(),
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  riskScore: calculateRisk()
});
```

## 📚 Further Reading

### Key Management
- [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing)
- [Multi-Party Computation](https://en.wikipedia.org/wiki/Secure_multi-party_computation)
- [Hardware Security Modules](https://en.wikipedia.org/wiki/Hardware_security_module)

### Solana Development
- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Devnet Faucet](https://faucet.solana.com/)

### Production Solutions
- [Fireblocks](https://www.fireblocks.com/)
- [Coinbase Custody](https://www.coinbase.com/custody)
- [Anchorage Digital](https://www.anchorage.com/)

## ⚠️ Disclaimer

This is a **proof of concept for educational purposes only**.

- ❌ Not suitable for production use
- ❌ Not secure for mainnet funds
- ❌ Has not undergone security audit
- ❌ Lacks disaster recovery
- ❌ Simplified cryptography

For production systems handling real assets, use established custodial solutions or engage professional security auditors.

## 📝 License

MIT License - Feel free to use for learning and experimentation.

## 🤝 Contributing

This is an educational POC. Suggestions for improvements are welcome!

---

**Remember**: Never share private keys or use test keys with mainnet funds!
