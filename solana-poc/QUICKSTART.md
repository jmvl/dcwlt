# Solana Key Sharding POC - Quick Start Guide

## 🚀 Running the POC

### Step 1: Start the Backend

```bash
cd /Users/jm/Codebase/dcwlt/solana-poc/backend
npm start
```

Backend runs on: **http://localhost:3001**

### Step 2: Open the Frontend

Open in browser: **http://localhost:8000/public/**

Or use the file directly: **file:///Users/jm/Codebase/dcwlt/solana-poc/public/index.html**

## 📋 How to Test

### Test 1: Generate Wallet with Key Sharding

1. Click **"Generate New Wallet"**
2. Observe the security info:
   - Shard 1 shown in browser (for demo purposes)
   - Shard 2 stored encrypted in backend RAM
   - Neither shard alone can sign transactions

**What happens:**
- Frontend generates Solana keypair locally
- Splits private key using XOR (Shard 1 + Shard 2)
- Shard 1 → Browser sessionStorage
- Shard 2 → Backend (encrypted in RAM)

### Test 2: Check Balance

1. Copy the generated wallet address
2. Click **"Check Balance"**
3. Initially shows 0 SOL

### Test 3: Request Airdrop

1. Click **"Request 1 SOL Airdrop"**
2. Wait ~3 seconds for confirmation
3. Balance updates to 1.0 SOL

**What happens:**
- Backend calls Solana Devnet faucet
- 1 SOL sent to your wallet
- Transaction signed on devnet (no real value)

### Test 4: Transfer SOL

1. Enter recipient address (can generate another wallet for testing)
2. Enter amount (e.g., 0.5)
3. Click **"Transfer SOL"**

**What happens under the hood:**
1. Browser sends Shard 1 to backend
2. Backend retrieves Shard 2 from memory
3. Backend combines shards: `key = shard1 XOR shard2`
4. Backend signs transaction
5. Backend immediately discards all key material
6. Transaction broadcast to Solana Devnet

### Test 5: Security Verification

#### A. Check Browser Storage
1. Open DevTools (F12)
2. Go to Application → Session Storage
3. See `shard1`, `walletId`, `walletAddress`
4. Shard 1 alone is useless!

#### B. Check Backend Storage
1. Try to restart backend server
2. Attempt another transfer
3. Error: "Shard 2 not found"
4. This proves shards are NOT persisted to disk!

#### C. Close Browser Tab
1. Close the tab
2. Reopen http://localhost:8000/public/
3. Shard 1 is gone (cleared with session)
4. Must generate/import new wallet

## 🔐 Security Demonstrations

### Demonstration 1: Why Sharding?

**Question:** What if attacker gets Shard 1?

**Answer:** Without Shard 2, they have nothing. The shard is random bytes that cannot derive the full key.

**Question:** What if attacker breaches the server?

**Answer:** They only get encrypted Shard 2. Without Shard 1, it's useless.

### Demonstration 2: Temporal Security

- **Browser shard:** Cleared when tab closes
- **Backend shard:** Cleared when server restarts
- **Full key:** Never stored, only combined briefly for signing

### Demonstration 3: Network Security

- Shard 2 encrypted during transmission
- Only shard transmitted (never full key)
- Backend never sees Shard 1
- Frontend never sees Shard 2 decrypted

## 📊 Key Management Q&A

### Q: How is this better than storing the full key in the browser?

**A:** With full key in browser:
- XSS attack = all funds lost immediately
- Browser extension malware = all funds lost

With sharding:
- XSS attack = only gets Shard 1 (useless)
- Need simultaneous server breach to steal funds

### Q: How is this better than storing the full key on the server?

**A:** With full key on server:
- Server breach = all users' funds lost
- Insider threat = all users' funds lost
- Database dump = all users' funds lost

With sharding:
- Server breach = only encrypted shards (useless)
- Insider threat = only useless partial data
- No database = nothing to steal

### Q: What about production systems?

**A:** Production systems would use:
1. **Shamir's Secret Sharing** (not XOR)
2. **3-of-5 threshold** (distributed)
3. **Geographic distribution** (different regions)
4. **Hardware Security Modules** (HSMs)
5. **Multi-Party Computation** (MPC)
6. **Audit logging** and monitoring
7. **Disaster recovery** mechanisms

### Q: Can I see the full private key?

**A:** Not in this POC! The full key is:
- Never stored
- Never transmitted
- Never displayed
- Only combined briefly in RAM for signing

To see your key, you'd need to modify the code to log it during key generation.

## 🧪 Advanced Testing

### Test: Concurrent Access

1. Generate wallet in Tab A
2. Try to use same wallet in Tab B
3. Tab B cannot access (no Shard 1)
4. Demonstrates session isolation

### Test: Server Restart

1. Generate wallet and do airdrop
2. Note the balance (should be 1 SOL)
3. Restart backend: Ctrl+C → `npm start`
4. Try to transfer SOL
5. Error: "Shard 2 not found"
6. Balance still exists on-chain
7. Wallet must be re-imported

## 📈 Production Path

This POC demonstrates the CONCEPT. For production:

### Phase 1: Improved Cryptography
- Replace XOR with Shamir's Secret Sharing
- Increase threshold: 2-of-3 or 3-of-5
- Add verifiable secret sharing

### Phase 2: Distribution
- Multiple backend servers
- Geographic distribution
- Independent custody providers

### Phase 3: Hardware Security
- HSMs for shard storage
- Secure enclaves for signing
- Hardware-backed key derivation

### Phase 4: Recovery
- Social recovery
- Time-locked recovery
- Multi-sig fallback

### Phase 5: Compliance
- Audit logging
- Regulatory reporting
- Insurance coverage

## 🎯 Learning Outcomes

After testing this POC, you should understand:

1. ✅ Why single-point storage is risky
2. ✅ How key sharding improves security
3. ✅ Trade-offs between security and usability
4. ✅ What's needed for production systems
5. ✅ Solana Devnet interaction basics
6. ✅ Wallet operations (balance, airdrop, transfer)

## 📝 Next Steps

1. **Read** the full README.md for architecture details
2. **Study** SECURITY.md for threat model
3. **Experiment** with different scenarios
4. **Research** production solutions (Fireblocks, etc.)
5. **Learn** about Shamir's Secret Sharing
6. **Understand** MPC and HSMs

## 🆘 Troubleshooting

**Problem:** "Backend disconnected"
**Solution:** Ensure backend is running on port 3001

**Problem:** "Shard 2 not found"
**Solution:** Server was restarted, generate new wallet

**Problem:** Airdrop fails
**Solution:** Devnet faucet rate-limited, wait a few minutes

**Problem:** Transfer fails
**Solution:** Ensure sufficient balance and correct address

---

⚠️ **Remember:** This is Devnet only. No real money involved!
