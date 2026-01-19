#!/usr/bin/env node
/**
 * Create Event Token on Solana Devnet
 * This script creates an SPL token without needing the spl-token CLI
 */

const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createInitializeMint2Instruction, TOKEN_PROGRAM_ID, getMinimumBalanceForRentExemptMint, MINT_SIZE } = require('@solana/spl-token');
const fs = require('fs');

async function createToken() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Load bank wallet
  const bankWalletSecretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/bank-wallet.json', 'utf8'));
  const bankWallet = Keypair.fromSecretKey(new Uint8Array(bankWalletSecretKey));

  console.log('Bank Wallet:', bankWallet.publicKey.toBase58());

  // Check balance
  const balance = await connection.getBalance(bankWallet.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL');

  if (balance < 10000000) {
    console.error('\n❌ Insufficient SOL. Run: solana airdrop 2');
    process.exit(1);
  }

  // Generate token mint
  const tokenMint = Keypair.generate();
  console.log('\n🪙 Creating Token...');
  console.log('Token Address:', tokenMint.publicKey.toBase58());

  const transaction = new Transaction()
    .add(SystemProgram.createAccount({
      fromPubkey: bankWallet.publicKey,
      newAccountPubkey: tokenMint.publicKey,
      lamports: await getMinimumBalanceForRentExemptMint(connection),
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    }))
    .add(createInitializeMint2Instruction(
      tokenMint.publicKey,
      9, // decimals
      bankWallet.publicKey,
      null, // no freeze authority
      TOKEN_PROGRAM_ID
    ));

  const signature = await connection.sendTransaction(transaction, [bankWallet, tokenMint]);
  console.log('TX:', signature);

  await connection.confirmTransaction(signature);
  console.log('\n✅ SUCCESS!');
  console.log('\n⚠️  SAVE THIS TOKEN ADDRESS:', tokenMint.publicKey.toBase58());
  console.log('\nUpdate these files:');
  console.log('  event-wallet/src/config/constants.ts');
  console.log('  backend/.env');
  console.log('  merchant/.env');
}

createToken().catch(console.error);
