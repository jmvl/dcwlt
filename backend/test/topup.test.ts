import { describe, test, expect, beforeAll, afterEach } from '@jest/globals';
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import request from 'supertest';
import { app } from '../src/server';

describe('POST /api/topup - ATA Auto-Creation Tests', () => {
  let connection: Connection;
  let bankWallet: Keypair;
  let tokenMint: PublicKey;
  let testWallet: Keypair;

  beforeAll(() => {
    // Setup connection to Solana Devnet
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Load configuration from environment
    const bankWalletPath = process.env.BANK_WALLET_PATH;
    const tokenAddress = process.env.TOKEN_ADDRESS;

    if (!bankWalletPath || !tokenAddress) {
      throw new Error('Missing required environment variables: BANK_WALLET_PATH, TOKEN_ADDRESS');
    }

    // Load bank wallet
    const fs = require('fs');
    const secretKey = JSON.parse(fs.readFileSync(bankWalletPath, 'utf8'));
    bankWallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    tokenMint = new PublicKey(tokenAddress);

    // Generate a fresh test wallet
    testWallet = Keypair.generate();

    console.log('Test Setup:');
    console.log('  Bank Wallet:', bankWallet.publicKey.toBase58());
    console.log('  Token Mint:', tokenMint.toBase58());
    console.log('  Test Wallet:', testWallet.publicKey.toBase58());
  });

  afterEach(async () => {
    // Clean up: optionally airdrop SOL to test wallet for future tests
    const balance = await connection.getBalance(testWallet.publicKey);
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      try {
        const signature = await connection.requestAirdrop(
          testWallet.publicKey,
          0.5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(signature);
        console.log('Airdropped 0.5 SOL to test wallet');
      } catch (error) {
        console.warn('Failed to airdrop SOL:', error);
      }
    }
  });

  describe('Scenario 1: User wallet has no ATA', () => {
    test('should automatically create ATA and transfer tokens', async () => {
      const freshWallet = Keypair.generate();
      const topUpAmount = 50;

      console.log('\n[Test] Testing top-up to wallet with no ATA');
      console.log('  Wallet:', freshWallet.publicKey.toBase58());

      // Verify ATA does not exist before top-up
      const ataAddress = await getAssociatedTokenAddress(
        tokenMint,
        freshWallet.publicKey
      );

      let ataExists = false;
      try {
        await getAccount(connection, ataAddress);
        ataExists = true;
      } catch (error) {
        // ATA doesn't exist, which is expected
        console.log('  Confirmed: ATA does not exist');
      }

      expect(ataExists).toBe(false);

      // Make top-up request
      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: freshWallet.publicKey.toBase58(),
          amount: topUpAmount
        });

      console.log('  Response:', response.status);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(topUpAmount);
      expect(response.body.signature).toBeDefined();

      // Verify ATA was created
      try {
        const ataAccount = await getAccount(connection, ataAddress);
        console.log('  ATA created:', ataAddress.toBase58());
        console.log('  ATA Owner:', ataAccount.owner.toBase58());
        console.log('  ATA Balance:', Number(ataAccount.amount));

        expect(ataAccount.owner.toBase58()).toBe(freshWallet.publicKey.toBase58());
        expect(Number(ataAccount.amount)).toBe(topUpAmount * 1e9); // 9 decimals
      } catch (error) {
        throw new Error(`ATA was not created: ${error}`);
      }

      // Verify transaction on explorer
      console.log('  Explorer:', response.body.explorerUrl);
    }, 30000);
  });

  describe('Scenario 2: User wallet already has ATA', () => {
    test('should transfer tokens without creating new ATA', async () => {
      const existingWallet = Keypair.generate();
      const topUpAmount = 75;

      console.log('\n[Test] Testing top-up to wallet with existing ATA');
      console.log('  Wallet:', existingWallet.publicKey.toBase58());

      // First, ensure the wallet has SOL for ATA creation
      try {
        const signature = await connection.requestAirdrop(
          existingWallet.publicKey,
          1 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(signature);
        console.log('  Airdropped 1 SOL for ATA creation');
      } catch (error) {
        console.warn('Airdrop failed (may have sufficient SOL):', error);
      }

      // Create ATA manually first
      const ataAddress = await getAssociatedTokenAddress(
        tokenMint,
        existingWallet.publicKey
      );

      console.log('  ATA Address:', ataAddress.toBase58());

      // We need bankWallet to create the ATA, so we'll just do a small top-up first
      const initialResponse = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: existingWallet.publicKey.toBase58(),
          amount: 10
        });

      expect(initialResponse.status).toBe(200);
      expect(initialResponse.body.success).toBe(true);

      // Wait for confirmation
      await connection.confirmTransaction(initialResponse.body.signature);

      console.log('  Initial ATA created via first top-up');

      // Now test second top-up (ATA already exists)
      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: existingWallet.publicKey.toBase58(),
          amount: topUpAmount
        });

      console.log('  Response:', response.status);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(topUpAmount);
      expect(response.body.signature).toBeDefined();

      // Verify final balance (10 + 75 = 85)
      const ataAccount = await getAccount(connection, ataAddress);
      const finalBalance = Number(ataAccount.amount);
      console.log('  Final Balance:', finalBalance / 1e9, 'tokens');

      expect(finalBalance).toBe(85 * 1e9); // 9 decimals
    }, 60000);
  });

  describe('Scenario 3: ATA creation error handling', () => {
    test('should handle invalid wallet address gracefully', async () => {
      console.log('\n[Test] Testing invalid wallet address');

      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: 'invalid-address',
          amount: 50
        });

      console.log('  Response:', response.status);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle missing wallet address', async () => {
      console.log('\n[Test] Testing missing wallet address');

      const response = await request(app)
        .post('/api/topup')
        .send({
          amount: 50
        });

      console.log('  Response:', response.status);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('walletAddress is required');
    });
  });

  describe('Scenario 4: Multiple sequential top-ups', () => {
    test('should handle multiple top-ups to same wallet', async () => {
      const wallet = Keypair.generate();

      console.log('\n[Test] Testing multiple sequential top-ups');
      console.log('  Wallet:', wallet.publicKey.toBase58());

      const topUps = [25, 50, 25];
      let expectedBalance = 0;

      for (const amount of topUps) {
        const response = await request(app)
          .post('/api/topup')
          .send({
            walletAddress: wallet.publicKey.toBase58(),
            amount
          });

        console.log(`  Top-up ${amount} tokens:`, response.status);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.amount).toBe(amount);

        expectedBalance += amount;

        // Wait for transaction confirmation
        await connection.confirmTransaction(response.body.signature);

        // Verify balance
        const ataAddress = await getAssociatedTokenAddress(
          tokenMint,
          wallet.publicKey
        );
        const ataAccount = await getAccount(connection, ataAddress);
        const currentBalance = Number(ataAccount.amount);

        console.log(`  Current balance: ${currentBalance / 1e9} tokens`);
        expect(currentBalance).toBe(expectedBalance * 1e9);
      }

      console.log('  Final balance:', expectedBalance, 'tokens');
    }, 90000);
  });

  describe('Scenario 5: Amount validation', () => {
    test('should reject negative amounts', async () => {
      const wallet = Keypair.generate();

      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: wallet.publicKey.toBase58(),
          amount: -10
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('positive number');
    });

    test('should reject zero amount', async () => {
      const wallet = Keypair.generate();

      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: wallet.publicKey.toBase58(),
          amount: 0
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('positive number');
    });

    test('should use default amount of 50 if not specified', async () => {
      const wallet = Keypair.generate();

      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: wallet.publicKey.toBase58()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(50);
    }, 30000);
  });
});
