"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const qrcode_1 = __importDefault(require("qrcode"));
const dotenv_1 = __importDefault(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
// Merchant wallet address (create one and save here)
const MERCHANT_WALLET = process.env.MERCHANT_WALLET || 'YOUR_MERCHANT_WALLET_ADDRESS';
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || 'YOUR_TOKEN_ADDRESS';
/**
 * Generate Solana Pay URL for QR code
 * Format: solana:<address>?amount=X&spl-token=<TOKEN>
 */
function generateSolanaPayURL(recipient, amount, splToken) {
    const url = new URL('solana:' + recipient);
    url.searchParams.set('amount', amount.toString());
    url.searchParams.set('spl-token', splToken);
    return url.toString();
}
/**
 * Validate Solana address
 */
function isValidSolanaAddress(address) {
    try {
        new web3_js_1.PublicKey(address);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    const merchantConfigured = MERCHANT_WALLET !== 'YOUR_MERCHANT_WALLET_ADDRESS';
    const tokenConfigured = TOKEN_ADDRESS !== 'YOUR_TOKEN_ADDRESS';
    res.json({
        status: 'ok',
        service: 'event-wallet-merchant',
        merchantConfigured,
        tokenConfigured,
        merchantWallet: MERCHANT_WALLET,
        network: 'solana-devnet'
    });
});
/**
 * Generate QR code for payment
 * GET /api/qr/:amount
 */
app.get('/api/qr/:amount', async (req, res) => {
    try {
        const amount = parseFloat(req.params.amount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount. Must be a positive number.'
            });
        }
        // Validate configuration
        if (MERCHANT_WALLET === 'YOUR_MERCHANT_WALLET_ADDRESS') {
            return res.status(500).json({
                success: false,
                error: 'Merchant wallet not configured. Set MERCHANT_WALLET in .env'
            });
        }
        if (TOKEN_ADDRESS === 'YOUR_TOKEN_ADDRESS') {
            return res.status(500).json({
                success: false,
                error: 'Token address not configured. Set TOKEN_ADDRESS in .env'
            });
        }
        if (!isValidSolanaAddress(MERCHANT_WALLET)) {
            return res.status(500).json({
                success: false,
                error: 'Invalid merchant wallet address'
            });
        }
        // Generate Solana Pay URL
        const solanaPayURL = generateSolanaPayURL(MERCHANT_WALLET, amount, TOKEN_ADDRESS);
        console.log(`📱 Generating QR code: ${amount} EVT to ${MERCHANT_WALLET.slice(0, 8)}...`);
        // Generate QR code as data URL
        const qrDataUrl = await qrcode_1.default.toDataURL(solanaPayURL, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });
        res.json({
            success: true,
            qrCode: qrDataUrl,
            url: solanaPayURL,
            amount,
            recipient: MERCHANT_WALLET,
            token: TOKEN_ADDRESS
        });
    }
    catch (error) {
        console.error('❌ QR generation error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate QR code'
        });
    }
});
/**
 * Get service status
 */
app.get('/api/status', (req, res) => {
    res.json({
        service: 'Event Wallet Merchant Terminal',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            qr: 'GET /api/qr/:amount',
            status: 'GET /api/status'
        },
        configuration: {
            merchantWalletConfigured: MERCHANT_WALLET !== 'YOUR_MERCHANT_WALLET_ADDRESS',
            tokenAddressConfigured: TOKEN_ADDRESS !== 'YOUR_TOKEN_ADDRESS',
            merchantWallet: MERCHANT_WALLET,
            network: 'solana-devnet'
        }
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: ['/health', '/api/qr/:amount', '/api/status']
    });
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🏪 Event Wallet Merchant Terminal`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Network: Solana Devnet`);
    console.log(`\n📚 Endpoints:`);
    console.log(`   GET  /health         - Health check`);
    console.log(`   GET  /api/qr/:amount - Generate payment QR code`);
    console.log(`   GET  /api/status     - Service status\n`);
});
