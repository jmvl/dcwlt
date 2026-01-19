# Deployment Guide

Guide for deploying DCWLT components to production environments.

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Backend Deployment](#backend-deployment)
- [Merchant Deployment](#merchant-deployment)
- [Mobile App Deployment](#mobile-app-deployment)
- [Infrastructure](#infrastructure)
- [Monitoring](#monitoring)
- [Security Considerations](#security-considerations)

---

## Overview

⚠️ **IMPORTANT**: DCWLT is a Proof of Concept running on Solana Devnet only. This guide outlines how production deployment would work, but should NOT be executed without proper security review, legal compliance, and mainnet preparation.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Android   │  │  Android    │  │    iOS      │        │
│  │    App      │  │    App      │  │    App      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           │                                 │
│                           v                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │         Load Balancer / API Gateway         │           │
│  └─────────────────────────────────────────────┘           │
│                           │                                 │
│           ┌───────────────┼───────────────┐                 │
│           v               v               v                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Backend   │  │   Backend   │  │   Backend   │        │
│  │  Instance   │  │  Instance   │  │  Instance   │        │
│  │   (Node)    │  │   (Node)    │  │   (Node)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                           │                                 │
│                           v                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │          PostgreSQL + Redis                 │           │
│  └─────────────────────────────────────────────┘           │
│                           │                                 │
│                           v                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │         Solana Mainnet / Testnet            │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (target: 85% coverage)
- [ ] Code reviewed by at least one other developer
- [ ] No console.log statements in production code
- [ ] Environment variables properly configured
- [ ] Secrets stored in secure vault (not in code)

### Security

- [ ] Input validation on all API endpoints
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] HTTPS/TLS enabled
- [ ] API authentication implemented
- [ ] Web3Auth production configuration
- [ ] Bank wallet key secured in HSM/KMS

### Compliance

- [ ] Legal review completed
- [ ] Terms of service in place
- [ ] Privacy policy published
- [ ] KYC/AML procedures (if required)
- [ ] Data protection compliance (GDPR/CCPA)

### Infrastructure

- [ ] Monitoring configured
- [ ] Logging set up
- [ ] Error tracking (Sentry) configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented

---

## Backend Deployment

### Platform Options

| Platform | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| AWS Lambda | Serverless, auto-scaling | Cold starts, 15s timeout | ❌ Not suitable (blockchain tx time) |
| AWS EC2 | Full control, no timeout | Manual scaling | ✅ Recommended |
| Google Cloud Run | Managed, auto-scaling | Request time limits | ✅ Good option |
| DigitalOcean | Simple, affordable | Manual scaling | ✅ Good for MVP |
| Heroku | Easy setup | Expensive at scale | ⚠️ Good for testing |

### Example: AWS EC2 Deployment

#### 1. Prepare EC2 Instance

```bash
# Launch Ubuntu 22.04 LTS instance
# - Instance type: t3.medium (minimum)
# - Storage: 20GB SSD
# - Security Group: Allow ports 80, 443, 22
# - IAM Role: EC2 role with SSM access

# SSH into instance
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com
```

#### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify installation
node --version
npm --version
```

#### 3. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/dcwlt.git
cd dcwlt/backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=production
RPC_URL=https://api.mainnet-beta.solana.com
TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS
BANK_WALLET_PATH=/home/ubuntu/.config/solana/id.json
EOF

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name dcwlt-backend

# Configure PM2 to start on boot
pm2 startup systemd
pm2 save
```

#### 4. Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo tee /etc/nginx/sites-available/dcwlt-backend << EOF
server {
    listen 80;
    server_name api.dcwlt.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/dcwlt-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.dcwlt.com

# Auto-renewal (configured automatically)
sudo certbot renew --dry-run
```

### Environment Variables

**Production `.env`**:

```env
# Server
PORT=3000
NODE_ENV=production

# Solana
RPC_URL=https://api.mainnet-beta.solana.com
TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS

# Bank Wallet (stored in secure location)
BANK_WALLET_PATH=/secure/location/bank-wallet.json

# Security
API_KEY=your-api-key-here
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info
```

---

## Merchant Deployment

### Deployment Strategy

Similar to backend, but can be simpler since it only generates QR codes.

#### Example: DigitalOcean App Platform

```yaml
# .do/app.yaml
version: 1.0
name: dcwlt-merchant
services:
  - name: merchant-api
    source_dir: /
    github:
      repo: your-org/dcwlt
      branch: main
    run_command: npm start
    environment_slug: node-js
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: TOKEN_ADDRESS
        value: YOUR_TOKEN_ADDRESS
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    health_check:
      http_path: /health
```

### Deployment Commands

```bash
# Install Doctl
brew install doctl

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml
```

---

## Mobile App Deployment

### Android (Google Play Store)

#### 1. Build Release APK

```bash
cd event-wallet

# Update version in app.json
# "version": "1.0.0"

# Build production bundle
eas build --platform android --production

# Or build locally
npx expo run:android --variant release
```

#### 2. Generate Signing Key

```bash
# Generate keystore
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore dcwlt-release-key.keystore \
  -alias dcwlt-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD

# Place in secure location (NOT in git)
mv dcwlt-release-key.keystore ~/secure-location/
```

#### 3. Configure Gradle

Edit `event-wallet/android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('YOUR_KEYSTORE_PATH')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'YOUR_KEY_ALIAS'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 4. Build Signed APK/AAB

```bash
cd event-wallet/android

# Build APK (for testing)
./gradlew assembleRelease

# Build AAB (for Play Store)
./gradlew bundleRelease
```

Output:
- APK: `app/build/outputs/apk/release/app-release.apk`
- AAB: `app/build/outputs/bundle/release/app-release.aab`

#### 5. Google Play Console

1. Create developer account ($25 one-time fee)
2. Create new app
3. Complete store listing:
   - Title: "DCWLT Wallet"
   - Description: App description
   - Screenshots: 2 phone screenshots, 1 tablet screenshot
   - Icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
4. Upload AAB file
5. Complete content rating questionnaire
6. Set pricing (Free)
7. Submit for review

### iOS (App Store)

#### 1. Apple Developer Account

1. Enroll in Apple Developer Program ($99/year)
2. Create App ID in Developer Portal
3. Create Distribution Certificate
4. Create Provisioning Profile

#### 2. Build with EAS

```bash
cd event-wallet

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --production
```

#### 3. App Store Connect

1. Create new app
2. Complete app information
3. Upload build (via EAS submit)
4. Submit for review

---

## Infrastructure

### Database (Future)

**PostgreSQL Schema**:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  signature VARCHAR(88) UNIQUE NOT NULL,
  from_address VARCHAR(44) NOT NULL,
  to_address VARCHAR(44) NOT NULL,
  amount BIGINT NOT NULL,
  token_address VARCHAR(44) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_transactions_from ON transactions(from_address);
CREATE INDEX idx_transactions_to ON transactions(to_address);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

### Caching (Redis)

```bash
# Install Redis
sudo apt install -y redis-server

# Configure memory limit
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl start redis
```

### Monitoring

**Recommended Stack**:
- **Metrics**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Errors**: Sentry
- **Uptime**: UptimeRobot

**Example PM2 Monitoring**:

```bash
# Install PM2 Plus
pm2 plus

# Or setup basic monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Security Considerations

### API Security

#### Rate Limiting

```typescript
// Express rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,              // 100 requests per minute
  message: 'Too many requests',
});

app.use('/api/', limiter);
```

#### API Keys

```typescript
// API key middleware
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

app.use('/api/', apiKeyMiddleware);
```

### Wallet Security

**Production Requirements**:

1. **Bank Wallet in HSM**: Use AWS KMS or similar
2. **Multi-Sig**: Require multiple approvals for large transfers
3. **Cold Storage**: Keep majority of tokens offline
4. **Audit Trail**: Log all wallet operations

```typescript
// Example: AWS KMS integration
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

const kmsClient = new KMSClient({ region: 'us-east-1' });

async function getBankKeypair() {
  const ciphertext = process.env.BANK_WALLET_ENCRYPTED;
  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(ciphertext, 'base64'),
  });

  const { Plaintext } = await kmsClient.send(command);
  return Keypair.fromSecretKey(Plaintext);
}
```

### Web Security

**Headers**:

```typescript
// Helmet.js for security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Input Validation

```typescript
// Joi validation
import Joi from 'joi';

const topUpSchema = Joi.object({
  walletAddress: Joi.string()
    .base64()
    .length(44)
    .required(),
  amount: Joi.number()
    .positive()
    .max(10000)
    .required(),
});

app.post('/api/topup', async (req, res) => {
  const { error, value } = topUpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // Process request...
});
```

---

## Monitoring

### Health Checks

```typescript
// Backend health endpoint
app.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    solana: await checkSolanaConnection(),
    database: await checkDatabase(),
  };

  const healthy = Object.values(checks).every(v => v === true);
  res.status(healthy ? 200 : 503).json(checks);
});

async function checkSolanaConnection() {
  try {
    const version = await connection.getVersion();
    return true;
  } catch {
    return false;
  }
}
```

### Metrics

```typescript
// Prometheus metrics
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route, res.statusCode)
      .observe(duration);
  });
  next();
});
```

### Logging

```typescript
// Winston logger
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

---

## Cost Estimation

### Monthly Costs (Production)

| Service | Tier | Cost |
|---------|------|------|
| EC2 (3 instances) | t3.medium | $30/month |
| Load Balancer | ALB | $20/month |
| RDS PostgreSQL | db.t3.micro | $15/month |
| ElastiCache Redis | cache.t3.micro | $12/month |
| S3 Storage | 10GB | $0.23/month |
| CloudWatch | Basic | $5/month |
| SSL Certificate | Let's Encrypt | $0 |
| Domain | .com | $12/year |
| **Total** | | **~$85/month** |

### Mobile App Costs

| Item | Cost |
|------|------|
| Google Play Developer | $25 (one-time) |
| Apple Developer Program | $99/year |
| EAS Build (Hobby) | $0/month |
| **Total Year 1** | $148 |

---

## Rollback Strategy

### Backend Rollback

```bash
# Using PM2
pm2 rollback dcwlt-backend

# Or manual redeploy
git checkout previous-stable-tag
npm run build
pm2 restart dcwlt-backend
```

### Mobile App Rollback

1. Upload previous version to Play Console
2. Request "expedited rollback" from Google
3. Users update within 24 hours

---

## Disaster Recovery

### Backup Strategy

1. **Database**: Daily automated backups
2. **Wallet Keys**: Offline backup in safety deposit box
3. **Configuration**: Version controlled in private repo
4. **Logs**: Export to S3 with 30-day retention

### Recovery Steps

1. Deploy new infrastructure from IaC
2. Restore database from latest backup
3. Import wallet keys from offline backup
4. Update DNS to point to new infrastructure
5. Verify all services operational

---

## Post-Deployment

### Monitoring Setup

1. Configure uptime monitoring
2. Set up alerting (PagerDuty, Slack)
3. Create dashboards for key metrics
4. Test incident response procedures

### Documentation

1. Update API documentation
2. Document runbooks for common issues
3. Create architecture diagrams
4. Write troubleshooting guides

### Support

1. Set up support email
2. Create FAQ page
3. Configure automated responses
4. Train support team

---

⚠️ **DISCLAIMER**: This is a POC running on Solana Devnet. Before any production deployment, ensure:

- Legal compliance in your jurisdiction
- Security audit by third-party firm
- Proper insurance coverage
- Incident response procedures
- Mainnet testing with small amounts
- Gradual rollout with monitoring
