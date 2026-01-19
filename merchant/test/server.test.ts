import request from 'supertest';
import { app } from '../src/server';

describe('Merchant API', () => {
    describe('GET /health', () => {
        it('should return 200 and service status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('service', 'event-wallet-merchant');
        });
    });

    describe('GET /api/status', () => {
        it('should return 200 and available endpoints', async () => {
            const response = await request(app).get('/api/status');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('endpoints');
        });
    });

    describe('GET /api/qr/:amount', () => {
        it('should return 200 and a QR code data URL', async () => {
            const response = await request(app).get('/api/qr/50');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('qrCode');
            expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);
        });

        it('should return 400 for invalid amount', async () => {
            const response = await request(app).get('/api/qr/invalid');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for unknown endpoints', async () => {
            const response = await request(app).get('/unknown');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });
    });
});
