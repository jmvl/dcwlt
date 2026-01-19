import re

with open('backend/src/server.ts', 'r') as f:
    content = f.read()

# Fix the import
content = re.sub(
    r"import \{ Connection, Keypair, PublicKey \} from '@solana/web3\.js';",
    "import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';",
    content
)

with open('backend/src/server.ts', 'w') as f:
    f.write(content)

print("Fixed Transaction import in backend/src/server.ts")
