#!/bin/bash
# Fix missing Transaction import in backend/src/server.ts

FILE="backend/src/server.ts"

# Backup the file
cp "$FILE" "$FILE.bak"

# Fix the import
sed -i '' 's/import { Connection, Keypair, PublicKey } from '\''@solana\/web3.js'\'';/import { Connection, Keypair, PublicKey, Transaction } from '\''@solana\/web3.js'\'';/' "$FILE"

# Verify the fix
echo "Fixed import line:"
head -5 "$FILE" | grep "import.*@solana/web3.js"

echo "✅ Fixed Transaction import in backend/src/server.ts"
