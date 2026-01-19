# API Documentation

DCWLT (Digital Currency Wallet with Ledger Technology) exposes REST APIs for wallet top-up functionality and merchant payment QR code generation.

## Table of Contents

- [Overview](#overview)
- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Backend API](#backend-api)
  - [Merchant API](#merchant-api)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

DCWLT consists of two backend services:

1. **Backend API** (`localhost:3000`) - Handles token top-up operations
2. **Merchant API** (`localhost:3001`) - Generates payment QR codes

Both services communicate with Solana Devnet to perform blockchain operations.

## Base URLs

| Environment | Backend API                   | Merchant API                  |
| ----------- | ----------------------------- | ----------------------------- |
| Development | `http://localhost:3000`       | `http://localhost:3001`       |
| Production  | _(Not applicable - POC only)_ | _(Not applicable - POC only)_ |

## Authentication

**Current Status**: No authentication is implemented (POC only).

**Future Production Considerations**:

- API keys for rate limiting
- JWT tokens for authenticated requests
- OAuth 2.0 for third-party integrations

## API Reference

### Backend API

#### Top-Up Endpoint

Initiates a simulated Visa top-up by transferring Event Tokens from the bank wallet to the user's wallet.

```http
POST /api/topup
Content-Type: application/json
```

**Request Body**

```json
{
  "walletAddress": "string (Solana public key)",
  "amount": "number (positive integer)"
}
```

| Field           | Type   | Description                        | Example                                          |
| --------------- | ------ | ---------------------------------- | ------------------------------------------------ |
| `walletAddress` | string | Base58-encoded Solana public key   | `"7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"` |
| `amount`        | number | Amount of Event Tokens to transfer | `50`                                             |

**Success Response**

```json
{
  "success": true,
  "signature": "string (transaction signature)",
  "amount": "number (transferred amount)"
}
```

| Field       | Type    | Description                              |
| ----------- | ------- | ---------------------------------------- |
| `success`   | boolean | Indicates if the transfer was successful |
| `signature` | string  | Solana transaction signature (base58)    |
| `amount`    | number  | Amount of tokens transferred             |

**Status Codes**

| Code  | Description                |
| ----- | -------------------------- |
| `200` | Transfer successful        |
| `400` | Invalid request parameters |
| `500` | Server or blockchain error |

**Error Response**

```json
{
  "success": false,
  "error": "string (error message)"
}
```

**Example**

```bash
curl -X POST http://localhost:3000/api/topup \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "amount": 50
  }'
```

**Response**

```json
{
  "success": true,
  "signature": "3BZY2qPyno3JjqvNZKQiPG8DVSSvgfMRdKdqcKZmNfVhGNrF6S...",
  "amount": 50
}
```

### Merchant API

#### Home Page

Serves the merchant dashboard for generating QR codes.

```http
GET /
```

**Response**: HTML page with QR generation form

#### QR Code Generation

Generates a Solana Pay QR code for payment requests.

```http
GET /qr?amount=<amount>&merchant=<merchant_address>
```

**Query Parameters**

| Parameter  | Type   | Required | Description                      |
| ---------- | ------ | -------- | -------------------------------- |
| `amount`   | number | Yes      | Payment amount in Event Tokens   |
| `merchant` | string | Yes      | Merchant's Solana wallet address |

**Success Response**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Payment QR Code</title>
  </head>
  <body>
    <h1>Scan to Pay</h1>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANS..." />
    <p>Amount: 50 Event Tokens</p>
  </body>
</html>
```

**Example**

```bash
curl "http://localhost:3001/qr?amount=50&merchant=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
```

## Data Models

### TopUpRequest

```typescript
interface TopUpRequest {
  walletAddress: string; // Base58 Solana public key
  amount: number; // Positive integer
}
```

### TopUpResponse

```typescript
interface TopUpResponse {
  success: boolean;
  signature?: string; // Transaction signature if successful
  amount?: number; // Transferred amount if successful
  error?: string; // Error message if failed
}
```

### SolanaPayURL

```
solana:<MERCHANT_ADDRESS>?amount=<AMOUNT>&spl-token=<TOKEN_ADDRESS>&reference=<REFERENCE>&label=Merchant&message=Payment
```

| Parameter            | Description                         |
| -------------------- | ----------------------------------- |
| `<MERCHANT_ADDRESS>` | Merchant's Solana wallet address    |
| `<AMOUNT>`           | Payment amount                      |
| `<TOKEN_ADDRESS>`    | Event Token mint address            |
| `<REFERENCE>`        | Unique transaction reference (UUID) |
| `label`              | Display name for merchant           |
| `message`            | Payment description                 |

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Error                    | Description                     | Solution                    |
| ------------------------ | ------------------------------- | --------------------------- |
| `Invalid wallet address` | Malformed Solana address        | Verify address format       |
| `Invalid amount`         | Amount is not a positive number | Use positive integers       |
| `Insufficient funds`     | Bank wallet lacks tokens        | Airdrop more tokens to bank |
| `Transaction failed`     | Blockchain rejected transaction | Check Solana Devnet status  |

## Rate Limiting

**Current Status**: No rate limiting implemented (POC).

**Production Recommendations**:

| Endpoint          | Suggested Limit           |
| ----------------- | ------------------------- |
| `POST /api/topup` | 10 requests/minute per IP |
| `GET /qr`         | 60 requests/minute per IP |

## Transaction Confirmation

All blockchain transactions can be verified on [Solana Explorer](https://explorer.solana.com/?cluster=devnet) using the returned signature.

Example verification URL:

```
https://explorer.solana.com/tx/SIGNATURE?cluster=devnet
```

## OpenAPI Specification

See [openapi.yaml](./openapi.yaml) for the complete OpenAPI 3.0 specification.
