# DCWLT Documentation

Complete technical documentation for the DCWLT (Digital Currency Wallet with Ledger Technology) project.

## Quick Links

| Topic | Document |
|-------|----------|
| **Getting Started** | [Setup Guide](./guides/setup-guide.md) |
| **API Reference** | [API Documentation](./api/README.md) |
| **System Architecture** | [System Architecture](./architecture/system-architecture.md) |
| **Component Details** | [Component Documentation](./architecture/components.md) |
| **Sequence Diagrams** | [Sequence Diagrams](./diagrams/sequence-diagrams.md) |
| **Security** | [Security Overview](./security/README.md) |
| **Deployment** | [Deployment Guide](./guides/deployment-guide.md) |

## Documentation Structure

```
docs/
├── api/                           # API Documentation
│   ├── README.md                  # API overview and reference
│   └── openapi.yaml               # OpenAPI 3.0 specification
│
├── architecture/                  # Architecture Documentation
│   ├── system-architecture.md     # High-level system design
│   └── components.md              # Component-level documentation
│
├── diagrams/                      # Diagrams & Visualizations
│   └── sequence-diagrams.md       # Mermaid sequence diagrams
│
├── guides/                        # How-To Guides
│   ├── setup-guide.md             # Complete setup instructions
│   └── deployment-guide.md        # Production deployment guide
│
├── security/                      # Security Documentation
│   ├── README.md                  # Security overview
│   ├── wallet-security.md         # Wallet security architecture
│   └── cryptography-primer.md     # Educational cryptography guide
│
└── plans/                         # Project Plans
    └── 2025-01-13-android-wallet-poc.md
```

## Key Concepts

### Architecture Overview

DCWLT consists of three main components:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Mobile    │─────>│   Backend    │─────>│  Solana     │
│    App      │      │    APIs      │      │  Devnet     │
└─────────────┘      └──────────────┘      └─────────────┘
       │
       └────────────>  Merchant API
```

1. **Mobile App** (`event-wallet/`): React Native Android wallet
2. **Backend API** (`backend/`): Express server for top-ups
3. **Merchant API** (`merchant/`): Express server for QR generation

### User Flow

```
Gmail Login → Wallet Generated → Top-Up Tokens → QR Payments
     │              │                  │              │
     v              v                  v              v
  Web3Auth      Private Key        Bank Wallet    Merchant
  (OAuth)       (Ed25519)         Transfer       Wallet
```

### Security Model

| Aspect | Implementation |
|--------|----------------|
| **Authentication** | Web3Auth (Gmail OAuth) |
| **Key Storage** | Device secure storage (Keychain/KeyStore) |
| **Transaction Signing** | Local (private key never transmitted) |
| **Blockchain** | Solana Devnet (testnet) |
| **Custody** | Non-custodial (user controls keys) |

## Documentation by Audience

### For New Developers

Start here:
1. [Setup Guide](./guides/setup-guide.md) - Get your development environment running
2. [System Architecture](./architecture/system-architecture.md) - Understand the big picture
3. [Component Documentation](./architecture/components.md) - Learn about each component

### For API Users

1. [API Documentation](./api/README.md) - API reference and examples
2. [OpenAPI Spec](./api/openapi.yaml) - Machine-readable specification
3. [Sequence Diagrams](./diagrams/sequence-diagrams.md) - Flow visualization

### For Security Researchers

1. [Security Overview](./security/README.md) - Security architecture
2. [Wallet Security](./security/wallet-security.md) - Detailed security analysis
3. [Cryptography Primer](./security/cryptography-primer.md) - Educational cryptography guide

### For DevOps Engineers

1. [Deployment Guide](./guides/deployment-guide.md) - Production deployment
2. [System Architecture](./architecture/system-architecture.md) - Infrastructure design
3. [API Documentation](./api/README.md) - API endpoints and monitoring

## Common Tasks

### Setting Up Development Environment

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..
cd merchant && npm install && cd ..
cd event-wallet && npm install && cd ..

# 2. Configure Solana
solana config set --url devnet

# 3. Create Event Token (one-time)
spl-token create-token  # Save TOKEN_ADDRESS!
spl-token create-account <TOKEN_ADDRESS>
spl-token mint <TOKEN_ADDRESS> 1000000

# 4. Update configuration files
# Edit event-wallet/src/config/constants.ts
# Edit backend/.env
# Edit merchant/.env

# 5. Run services
cd backend && npm run dev &
cd merchant && npm run dev &
cd event-wallet && npm start &
```

### Running the Application

```bash
# Terminal 1: Backend API
cd backend && npm run dev

# Terminal 2: Merchant API
cd merchant && npm run dev

# Terminal 3: Mobile App
cd event-wallet && npx expo run:android
```

### Verifying Setup

1. **Backend**: Visit `http://localhost:3000` - Should show "Backend API"
2. **Merchant**: Visit `http://localhost:3001` - Should show merchant dashboard
3. **Mobile**: App should launch on emulator with login screen

### Testing the Flow

1. **Gmail Login**: Tap "Continue with Google" in app
2. **Simulate Top-Up**: Tap "Simulate Top Up" button
3. **Generate QR**: Visit `http://localhost:3001/qr?amount=50&merchant=<address>`
4. **Scan QR**: Use app to scan QR code and pay

## Project Status

**Current Phase**: Development POC

**Technology Stack**:
- Mobile: React Native + Expo + TypeScript
- Backend: Express + TypeScript + Node.js
- Blockchain: Solana Devnet + SPL Token
- Auth: Web3Auth (Gmail OAuth)

**Important Notes**:
- ⚠️ This is a POC running on Solana Devnet
- ⚠️ No real money involved (testnet only)
- ⚠️ Not production-ready
- ⚠️ Security audit required before mainnet

## Contributing

When contributing to documentation:

1. Follow the existing structure and format
2. Use Mermaid for diagrams
3. Include code examples where relevant
4. Update table of contents for new sections
5. Cross-reference related documents

## Support

For questions or issues:

- **Technical Issues**: Check [GitHub Issues](https://github.com/your-org/dcwlt/issues)
- **Security Issues**: Email security@dcwlt.com (see [Security Policy](./security/README.md))
- **General Questions**: Start a [GitHub Discussion](https://github.com/your-org/dcwlt/discussions)

## Changelog

| Date | Change |
|------|--------|
| 2025-01-13 | Complete documentation suite created |

---

**Last Updated**: 2025-01-13
