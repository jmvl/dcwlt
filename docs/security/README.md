# Security Documentation

Comprehensive security documentation for the DCWLT wallet system.

## Overview

DCWLT implements industry-standard security practices to protect user funds and private keys. This documentation explains the security architecture, cryptographic foundations, and best practices.

## Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Wallet Security](./wallet-security.md) | Complete security architecture, threat model, and protection mechanisms | All |
| [Cryptography Primer](./cryptography-primer.md) | Educational guide to the cryptography used in DCWLT | Developers, Security Researchers |

## Quick Security Facts

### What We Protect

✅ **Private Keys**: Never leave user device, never stored on servers
✅ **Transactions**: Signed locally with cryptographic guarantees
✅ **User Data**: OAuth-based authentication, no seed phrases
✅ **Blockchain**: Immutable ledger, all transactions verifiable

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Overview                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Authentication: Web3Auth (Gmail OAuth)                │
│  ├── Private Key Derivation: OAuth → Ed25519 Keypair        │
│  ├── Key Storage: Device secure storage (Keychain/KeyStore) │
│  └── Key Recovery: Re-authenticate with Gmail               │
│                                                             │
│  Transaction Security:                                      │
│  ├── Signing: Local (private key never transmitted)        │
│  ├── Verification: Cryptographic (Ed25519)                 │
│  └── Confirmation: Blockchain (Solana Devnet)               │
│                                                             │
│  Network Security:                                          │
│  ├── Transport: HTTPS/TLS 1.3                              │
│  ├── Validation: Input validation on all endpoints         │
│  └── Rate Limiting: (Production: 100 req/min per IP)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Security Properties

### Non-Custodial

- Users maintain full control of their private keys
- Servers never see or store private keys
- No central point of failure for key storage

### Social Login

- No seed phrases to manage or lose
- Familiar OAuth flow (Gmail)
- Keys derived from OAuth token
- Recoverable through re-authentication

### Local Signing

- All transactions signed on device
- Private keys never transmitted
- Cryptographic proof of authorization
- Verifiable on blockchain

## Threat Model

### Protected Against

| Threat | Mitigation |
|--------|-----------|
| Server compromise | Keys never on servers |
| Private key extraction | Hardware-backed secure storage |
| Transaction tampering | Digital signatures + blockchain |
| Replay attacks | Nonce + recent blockhash |
| Clipboard hijacking | In-app transaction building |
| Seed phrase loss | No seed phrases (social recovery) |

### User Responsibilities

| Responsibility | Action |
|----------------|--------|
| Gmail security | Enable 2-factor authentication |
| Device security | Use strong PIN, enable biometrics |
| Transaction verification | Always check recipient and amount |
| Device integrity | Avoid rooted/jailbroken devices |
| Phishing awareness | Only download from official stores |

## Security Best Practices

### For Users

1. **Enable Gmail 2FA**: Your Gmail account secures your wallet
2. **Secure Your Device**: Use strong PIN/passcode and biometrics
3. **Verify Transactions**: Always check recipient address and amount
4. **Avoid Rooted Devices**: Rooted/jailbroken devices have weaker security
5. **Beware of Phishing**: Only download from official app stores

### For Developers

1. **Never Log Private Keys**: Use secure logging that excludes sensitive data
2. **Validate All Inputs**: Sanitize all user inputs on both client and server
3. **Use HTTPS Only**: All network communication must use TLS
4. **Keep Dependencies Updated**: Regular security audits and updates
5. **Implement Rate Limiting**: Prevent brute force and DoS attacks
6. **Follow Principle of Least Privilege**: Minimal permissions for all components

## Security Audits

### Current Status

| Component | Audit Status | Last Review |
|-----------|--------------|-------------|
| Web3Auth Integration | ✅ Reviewed by Web3Auth team | Ongoing |
| Cryptographic Implementation | ✅ Using audited libraries | @solana/web3.js |
| Backend API | ⚠️ POC (basic validation) | Needs audit |
| Mobile App | ⚠️ POC (basic security) | Needs audit |
| Infrastructure | ⚠️ Not deployed | N/A |

### Production Checklist

Before mainnet deployment:

- [ ] Third-party security audit
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Incident response plan
- [ ] Insurance coverage
- [ ] Compliance review (KYC/AML if applicable)

## Responsible Disclosure

### Security Policy

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. **DO** email: security@dcwlt.com (PGP preferred)
3. **DO** include:
   - Detailed description
   - Steps to reproduce
   - Potential impact
   - Suggested fix
4. **DO** allow 90 days for fix before public disclosure

### What We Promise

- Acknowledge receipt within 48 hours
- Provide timeline for assessment
- Credit you in security advisories
- Work with you on responsible disclosure

### What NOT To Do

- Attempt to access other users' wallets
- Disrupt service availability
- Exfiltrate user data
- Test on production systems without permission

### Scope

**In Scope**:
- dcwlt.com web applications
- dcwlt.com API endpoints
- Official DCWLT mobile applications

**Out of Scope**:
- Third-party integrations (Web3Auth, Solana)
- Physical attacks
- Social engineering
- DDoS attacks

## Security Resources

### External References

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Web3Auth Security Documentation](https://web3auth.io/docs/security)
- [Solana Security Best Practices](https://docs.solana.com/cli/securely-validating-transactions)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)

### Tools

- [Solana Explorer](https://explorer.solana.com) - Verify transactions
- [Web3Auth Explorer](https://explorer.web3auth.io) - Debug authentication

## Security Contact

- **General Inquiries**: security@dcwlt.com
- **PGP Key**: Available on keybase.io
- **Bug Bounty**: Coming soon

## Changelog

| Date | Change |
|------|--------|
| 2025-01-13 | Initial security documentation created |
| | |

---

Remember: Security is an ongoing process. This documentation will be updated as the system evolves and new threats are identified.
