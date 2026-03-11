import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ─────────────────────────────────────────────
//  MOCK PAYMENT SYSTEM (No Razorpay keys needed)
//  Simulates the exact same API Razorpay would use
// ─────────────────────────────────────────────

// Create Mock Order (replaces Razorpay order creation)
app.post('/create-order', async (req, res) => {
    const { amount, currency, receipt } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        // Generate a fake order ID that looks like a real Razorpay order
        const mockOrderId = `order_MOCK${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

        const mockOrder = {
            id: mockOrderId,
            entity: 'order',
            amount: Math.round(amount),
            amount_paid: 0,
            amount_due: Math.round(amount),
            currency: currency || 'INR',
            receipt: receipt || `rcpt_${Date.now()}`,
            status: 'created',
            created_at: Math.floor(Date.now() / 1000),
        };

        console.log('✅ Mock Order Created:', mockOrder.id, '| Amount:', mockOrder.amount, 'paise');
        res.json(mockOrder);

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Order creation failed', details: error.message });
    }
});

// Verify Mock Payment (replaces Razorpay signature verification)
app.post('/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    // In mock mode, we just accept all payments as successful
    console.log('✅ Mock Payment Verified:', razorpay_payment_id);
    res.json({
        success: true,
        message: 'Payment verified successfully (Mock Mode)',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Mock Payment Server running on port ${PORT}`);
    console.log(`💡 Using MOCK payment mode — no Razorpay keys needed`);
});