# Solana POC - Key Sharding Security Architecture

## Overview
This POC demonstrates secure key management using **key sharding** - splitting private keys between client (browser) and server to enhance security.

## Security Architecture

### Key Sharding Design

```
Original Private Key (64 bytes)
        ↓
    [Shamir's Secret Sharing]
        ↓
┌───────────────┬───────────────┐
│  Shard 1      │   Shard 2     │
│  (Browser)    │   (Backend)   │
│  Session      │   Encrypted   │
│  Storage      │   at Rest     │
└─────────────────┴───────────────┘
        ↓
    [Recombine]
        ↓
    Full Private Key
        ↓
    Sign Transaction
```

### Security Properties

1. **Single Point of Failure Elimination**
   - Compromising browser only gives 1 shard (useless)
   - Compromising backend only gives 1 shard (useless)
   - Both must be compromised to steal funds

2. **Temporal Security**
   - Browser shard cleared when session expires
   - Backend shard encrypted with AES-256-GCM

3. **Network Security**
   - Shard 2 NEVER transmitted over network
   - Only transaction signatures sent to backend

4. **Development Safety**
   - Devnet only (no real money at risk)
   - Clear warnings and visual indicators

### API Design

#### Frontend (Browser)
- Stores: Shard 1 (in sessionStorage)
- Operations:
  - Generate key pair locally
  - Create shard 1 & shard 2
  - Send shard 2 to backend (encrypted)
  - Request partial signature from backend
  - Combine and broadcast transaction

#### Backend (Express)
- Stores: Shard 2 (encrypted in memory only, never persisted)
- Operations:
  - Receive and decrypt shard 2
  - Generate partial signature
  - Return partial signature to frontend
  - NEVER has full private key in memory

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| XSS Attack | Shard 1 in sessionStorage (cleared on tab close) |
| Server Breach | Shard 2 encrypted, never persisted to disk |
| MITM Attack | HTTPS required, shard 2 encrypted in transit |
| Physical Access | Backend shard in RAM only, cleared on restart |
| Insider Threat | Audit logs, no single person has full key |

### Cryptographic Details

**Shamir's Secret Sharing Scheme:**
- Threshold: 2-of-2 (both shards required)
- Algorithm: secrets.js library
- Each shard: Same size as original key

**Backend Encryption:**
- Algorithm: AES-256-GCM
- Key Derivation: PBKDF2 with SHA-256
- Salt: Per-shard unique salt
- Iterations: 100,000

### Development vs Production

**POC Limitations (This Implementation):**
- Devnet only
- Simplified key sharding (2-of-2)
- In-memory backend storage
- No rate limiting
- No audit logging

**Production Requirements:**
- Hardware Security Modules (HSM)
- Multi-party computation (MPC)
- Biometric authentication
- Comprehensive audit trails
- Rate limiting and anomaly detection
- Insurance and recovery procedures

## Warning
⚠️ **This is a Proof of Concept for educational purposes only.**
- Never use with mainnet funds
- Not suitable for production without security audit
- Keys are split but not distributed geographically
- No disaster recovery mechanism
