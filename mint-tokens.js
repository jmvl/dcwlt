#!/usr/bin/env node
/**
 * Mint Event Tokens to bank wallet
 */

const { Connection, Keypair, Transaction } = require('@solana/web3.js');
const { createMintToInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');

async function mintTokens() {
  const TOKEN_ADDRESS = process.argv[2];
  const AMOUNT = parseInt(process.argv[3]) || 1000000;

  if (!TOKEN_ADDRESS) {
    console.log('Usage: node mint-tokens.js <TOKEN_ADDRESS> [AMOUNT]');
    process.exit(1);
  }

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const tokenMint = new PublicKey(TOKEN_ADDRESS);

  // Load bank wallet
  const bankWalletSecretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/bank-wallet.json', 'utf8'));
  const bankWallet = Keypair.fromSecretKey(new Uint8Array(bankWalletSecretKey));

  console.log('Minting', AMOUNT, 'tokens to', bankWallet.publicKey.toBase58());

  // Get associated token account
  const tokenAccount = await getAssociatedTokenAddress(tokenMint, bankWallet.publicKey);
  console.log('Token Account:', tokenAccount.toBase58());

  const transaction = new Transaction().add(
    createMintToInstruction(
      tokenMint,
      tokenAccount,
      bankWallet.publicKey,
      AMOUNT
    )
  );

  const signature = await connection.sendTransaction(transaction, [bankWallet]);
  console.log('TX:', signature);

  await connection.confirmTransaction(signature);
  console.log('\n✅ Tokens minted!');
}

mintTokens().catch(console.error);
