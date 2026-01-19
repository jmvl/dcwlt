/**
 * Integration tests for ATA auto-creation in /api/topup endpoint
 *
 * These tests verify that the backend automatically creates Associated Token Accounts (ATA)
 * for users who don't have one, and transfers tokens successfully.
 *
 * Prerequisites:
 * - Bank wallet must be configured in .env
 * - TOKEN_ADDRESS must be set in .env
 * - Backend server must be running on port 3000
 *
 * Run with: npm test test/topup-integration.test.ts
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount
} from '@solana/spl-token';
import request from 'supertest';
import { app } from '../src/server';

describe('POST /api/topup - ATA Auto-Creation Integration Tests', () => {
  let connection: Connection;
  let tokenMint: PublicKey;

  beforeAll(() => {
    // Setup connection to Solana Devnet
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Load configuration from environment
    const tokenAddress = process.env.TOKEN_ADDRESS;

    if (!tokenAddress) {
      throw new Error('Missing required environment variable: TOKEN_ADDRESS');
    }

    tokenMint = new PublicKey(tokenAddress);

    console.log('\n=== Test Setup ===');
    console.log('Token Mint:', tokenMint.toBase58());
    console.log('Network: Solana Devnet');
  });

  describe('Scenario 1: User wallet has no ATA (Auto-Creation)', () => {
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
        console.log('  ✓ Confirmed: ATA does not exist before top-up');
      }

      expect(ataExists).toBe(false);

      // Make top-up request
      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: freshWallet.publicKey.toBase58(),
          amount: topUpAmount
        });

      console.log('  Response status:', response.status);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(topUpAmount);
      expect(response.body.signature).toBeDefined();

      // Wait for transaction confirmation
      console.log('  Waiting for transaction confirmation...');
      await connection.confirmTransaction(response.body.signature, 'confirmed');
      console.log('  ✓ Transaction confirmed');

      // Verify ATA was created
      try {
        const ataAccount = await getAccount(connection, ataAddress);
        console.log('  ✓ ATA created:', ataAddress.toBase58());
        console.log('  ✓ ATA Owner:', ataAccount.owner.toBase58());
        console.log('  ✓ ATA Balance:', Number(ataAccount.amount) / 1e9, 'tokens');

        expect(ataAccount.owner.toBase58()).toBe(freshWallet.publicKey.toBase58());
        expect(Number(ataAccount.amount)).toBe(topUpAmount * 1e9); // 9 decimals
      } catch (error) {
        throw new Error(`ATA was not created: ${error}`);
      }

      // Log transaction details
      console.log('  ✓ Transaction signature:', response.body.signature);
      console.log('  ✓ Explorer:', response.body.explorerUrl);
    }, 60000);
  });

  describe('Scenario 2: User wallet already has ATA', () => {
    test('should transfer tokens to existing ATA', async () => {
      const existingWallet = Keypair.generate();
      const firstAmount = 25;
      const secondAmount = 50;

      console.log('\n[Test] Testing top-up to wallet with existing ATA');
      console.log('  Wallet:', existingWallet.publicKey.toBase58());

      // First top-up to create ATA
      console.log('  Step 1: Creating ATA with first top-up...');
      const firstResponse = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: existingWallet.publicKey.toBase58(),
          amount: firstAmount
        });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.success).toBe(true);

      // Wait for transaction confirmation
      await connection.confirmTransaction(firstResponse.body.signature);
      console.log('  ✓ First top-up confirmed:', firstResponse.body.signature);

      // Get ATA address
      const ataAddress = await getAssociatedTokenAddress(
        tokenMint,
        existingWallet.publicKey
      );

      // Verify ATA exists and has correct balance
      const ataAccount = await getAccount(connection, ataAddress);
      expect(Number(ataAccount.amount)).toBe(firstAmount * 1e9);
      console.log('  ✓ ATA exists with balance:', Number(ataAccount.amount) / 1e9, 'tokens');

      // Second top-up (ATA already exists)
      console.log('  Step 2: Top-up to existing ATA...');
      const secondResponse = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: existingWallet.publicKey.toBase58(),
          amount: secondAmount
        });

      console.log('  Response status:', secondResponse.status);

      // Assertions
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.success).toBe(true);
      expect(secondResponse.body.amount).toBe(secondAmount);
      expect(secondResponse.body.signature).toBeDefined();

      // Wait for transaction confirmation
      await connection.confirmTransaction(secondResponse.body.signature);

      // Verify final balance (25 + 50 = 75)
      const finalAtaAccount = await getAccount(connection, ataAddress);
      const finalBalance = Number(finalAtaAccount.amount);
      console.log('  ✓ Final balance:', finalBalance / 1e9, 'tokens');
      console.log('  ✓ Transaction signature:', secondResponse.body.signature);

      expect(finalBalance).toBe(75 * 1e9); // 9 decimals
    }, 90000);
  });

  describe('Scenario 3: Error handling', () => {
    test('should handle invalid wallet address gracefully', async () => {
      console.log('\n[Test] Testing invalid wallet address');

      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: 'invalid-address',
          amount: 50
        });

      console.log('  Response status:', response.status);
      console.log('  Error:', response.body.error);

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

      console.log('  Response status:', response.status);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('walletAddress is required');
    });

    test('should reject negative amounts', async () => {
      const wallet = Keypair.generate();

      const response = await request(app)
        .post('/api/topup')
        .send({
          walletAddress: wallet.publicKey.toBase58(),
          amount: -10
        });

      console.log('  Response status:', response.status);

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

      console.log('  Response status:', response.status);

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

      console.log('  Response status:', response.status);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(50);
    }, 60000);
  });

  describe('Scenario 4: Multiple sequential top-ups', () => {
    test('should handle multiple top-ups to same wallet correctly', async () => {
      const wallet = Keypair.generate();

      console.log('\n[Test] Testing multiple sequential top-ups');
      console.log('  Wallet:', wallet.publicKey.toBase58());

      const topUps = [30, 70]; // Reduced to 2 top-ups to avoid rate limiting
      let expectedBalance = 0;

      for (const amount of topUps) {
        // Add delay to avoid rate limiting (10 requests per minute)
        if (topUps.indexOf(amount) > 0) {
          console.log('  Waiting 10 seconds to avoid rate limiting...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }

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

      console.log('  ✓ Final balance:', expectedBalance, 'tokens');
    }, 120000);
  });
});
