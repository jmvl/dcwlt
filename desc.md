To build a functional **Proof of Concept (POC)** for Android that proves the "Gmail-to-Wallet-to-QR" flow without spending real money or dealing with bank approval yet, follow these steps.

We will use **Solana Devnet** (fake money) so development is free.

### Prerequisites

- **Node.js** installed on your computer.
- **Solana CLI** installed (to create your tokens).
- **Expo (React Native)**: The fastest framework to build Android apps.
- **Android Studio**: To run the Android Emulator (or use a physical Android phone).

---

### Step 1: Create Your "Event Token" (The Economy)

Before building the app, you need the "Event Coin" that exists on the blockchain.

1.  **Open Terminal:** Set Solana to Devnet.
    ```bash
    solana config set --url devnet
    ```
2.  **Create a Wallet (The "Bank"):**
    ```bash
    solana-keygen new
    solana airdrop 2  # Get fake SOL to pay for gas
    ```
3.  **Create the Token:**
    ```bash
    spl-token create-token
    # Output: Token Address (e.g., "EventToken123...") <- SAVE THIS
    ```
4.  **Create an Account to hold tokens:**
    ```bash
    spl-token create-account <Token_Address>
    ```
5.  **Mint Tokens (Print money):**
    ```bash
    spl-token mint <Token_Address> 1000000
    ```
    _Now your computer holds 1,000,000 "Event Coins". You will simulate the "Visa Top Up" by sending these coins to users._

---

### Step 2: Initialize the Android App

We will use **Expo** with a custom development client (needed for blockchain libraries).

1.  **Create Project:**
    ```bash
    npx create-expo-app event-wallet
    cd event-wallet
    ```
2.  **Install Dependencies:**
    You need the Solana web3 library, the QR scanner, and the Auth provider.
    ```bash
    npm install @solana/web3.js @solana/spl-token
    npm install @web3auth/react-native-sdk @web3auth/base
    npm install expo-camera expo-barcode-scanner
    npm install react-native-get-random-values react-native-buffer
    ```
3.  **Polyfills (Crucial for Crypto on Mobile):**
    React Native doesn't have standard Node.js crypto libraries, so you must add a `shim.js` file to your root and import it at the top of `App.js`. (Search "React Native Solana Polyfill" for the standard copy-paste code).

---

### Step 3: Implement "Gmail Login" (Web3Auth)

Instead of building a database, use Web3Auth. When they log in with Google, it regenerates their private key locally.

1.  Go to the **Web3Auth Dashboard** (free tier), create a project, and get your `ClientId`.
2.  **In `App.js`:**

    ```javascript
    import { Web3Auth } from "@web3auth/react-native-sdk";
    // Initialize
    const web3auth = new Web3Auth({
      clientId: "YOUR_CLIENT_ID",
      network: "testnet", // Use testnet for POC
    });

    const login = async () => {
      await web3auth.login({
        loginProvider: "google",
        redirectUrl: resolvedRedirectUrl,
      });
      // This returns the user's private key derived from Google!
      const privateKey = web3auth.privKey;
      // Now create a Solana Keypair from this key
    };
    ```

---

### Step 4: Build the "Top Up" Simulation

Since getting Stripe approval takes weeks, simulate the Visa payment for the POC.

1.  **Create a "Top Up" Button** in the app.
2.  **The Logic:**
    - Normally, this calls Stripe SDK.
    - **For POC:** When clicked, your app hits a simple backend endpoint (or runs a script) that uses the **"Bank Wallet"** (from Step 1) to transfer 50 "Event Tokens" to the user's wallet address.
3.  **Display Balance:**
    Use `@solana/web3.js` to query the user's token account balance on the Devnet and display it on the screen.

---

### Step 5: The QR Scanner (Spending)

1.  **Permissions:** Add Camera permissions to `app.json`.
2.  **Scanner Component:** Use `expo-camera`.
    ```javascript
    <Camera
      onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      style={StyleSheet.absoluteFillObject}
    />
    ```
3.  **Parsing:**
    The Merchant will generate a QR code containing a Solana Pay URL:
    `solana:<MERCHANT_ADDRESS>?amount=10&spl-token=<EVENT_TOKEN_ADDRESS>`
4.  **The Handle Function:**
    - Parse the URL to get the merchant address and amount.
    - Construct a transaction using `createTransferInstruction` (from `@solana/spl-token`).
    - Sign it with the user's Web3Auth key.
    - Send to the blockchain.

---

### Step 6: The Merchant View (To receive money)

You need something to scan. You don't need a second mobile app for this; a web page works.

1.  Create a simple HTML/React page.
2.  Use the **Solana Pay** library.
3.  Hardcode a "Beer - 5 Tokens" button.
4.  When clicked, it generates a QR code on the screen requesting 5 tokens to the Merchant Wallet address.

---

### Step 7: Build and Run on Android

Because of the crypto libraries, you cannot use "Expo Go" standard app. You must build a **Development Client**.

1.  **Connect Android Device** (Enable USB Debugging) or open Emulator.
2.  **Build:**
    ```bash
    npx expo run:android
    ```
3.  This will compile the native code (Web3Auth and Crypto libraries) and install the app on your Android device.

### POC Success Criteria

You know the POC is successful when:

1.  You open the Android App.
2.  You sign in with your real Gmail.
3.  You see a wallet address generated (without you setting a password).
4.  You click "Simulate Top Up" and wait 2 seconds.
5.  Your balance updates to "50 Event Coins".
6.  You point the camera at your laptop screen (showing the Merchant QR).
7.  The app says "Sent!" and your balance drops to "45 Event Coins".
