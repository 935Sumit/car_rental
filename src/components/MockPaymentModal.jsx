import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLockClosed, HiCreditCard, HiDeviceMobile, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import './MockPaymentModal.css';

const MockPaymentModal = ({ amount, currency, method, onSuccess, onFailure, onClose }) => {
    const [step, setStep] = useState(method || 'options'); // options, card, upi, processing, success
    const [errorMessage, setErrorMessage] = useState('');

    const formatAmount = (paise) => {
        return (paise / 100).toLocaleString('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
        });
    };

    const handlePayment = async () => {
        setStep('processing');
        setErrorMessage('');

        try {
            // Create order on mock server
            const response = await fetch('http://localhost:5000/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency })
            });

            if (!response.ok) throw new Error('Order creation failed');

            const order = await response.json();

            // Simulate realistic processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify on mock server
            const verifyRes = await fetch('http://localhost:5000/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: order.id,
                    razorpay_payment_id: 'pay_MOCK' + Math.random().toString(36).substring(7).toUpperCase(),
                    razorpay_signature: 'mock_sig_' + Math.random().toString(36).substring(7)
                })
            });

            const result = await verifyRes.json();

            if (result.success) {
                setStep('success');
                // Briefly show success state before closing
                setTimeout(() => {
                    onSuccess({
                        razorpay_payment_id: result.payment_id,
                        razorpay_order_id: result.order_id,
                        razorpay_signature: 'mock_signature'
                    });
                }, 1500);
            } else {
                setStep(method || 'options');
                setErrorMessage('Payment verification failed.');
            }
        } catch (err) {
            console.error(err);
            setStep(method || 'options');
            setErrorMessage('Could not connect to payment server. Make sure it is running.');
        }
    };

    return (
        <div className="mock-payment-overlay">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mock-payment-card"
            >
                <div className="mock-payment-header">
                    <div className="secure-badge">
                        <HiLockClosed /> Secure Checkout
                    </div>
                    <button className="mock-close" onClick={onClose}>×</button>
                </div>

                <div className="mock-payment-body">
                    {errorMessage && (
                        <div className="mock-error-box" style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>
                            {errorMessage}
                        </div>
                    )}

                    <div className="amount-display">
                        <span className="label">Amount to Pay</span>
                        <span className="value">{formatAmount(amount)}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'options' && (
                            <motion.div
                                key="options"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                className="payment-steps"
                            >
                                <p className="step-title">Choose Payment Method</p>
                                <div className="mock-options-list">
                                    <div className="mock-opt-item" onClick={() => setStep('card')}>
                                        <HiCreditCard className="opt-icon" />
                                        <div className="opt-text">
                                            <strong>Card Payment</strong>
                                            <span>Visa, Mastercard, RuPay</span>
                                        </div>
                                    </div>
                                    <div className="mock-opt-item" onClick={() => setStep('upi')}>
                                        <HiDeviceMobile className="opt-icon" />
                                        <div className="opt-text">
                                            <strong>UPI Payment</strong>
                                            <span>Google Pay, PhonePe, Paytm</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'card' && (
                            <motion.div
                                key="card"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="payment-steps"
                            >
                                {!method && <div className="back-nav" onClick={() => setStep('options')}>← Back to Options</div>}
                                <div className="step-title" style={{ marginBottom: '20px' }}>Card Details</div>
                                <div className="mock-form">
                                    <input type="text" placeholder="Card Number" value="4111 1111 1111 1111" readOnly />
                                    <div className="form-row">
                                        <input type="text" placeholder="Expiry" value="12/28" readOnly />
                                        <input type="password" placeholder="CVV" value="***" readOnly />
                                    </div>
                                    <button className="pay-now-btn" onClick={handlePayment}>Pay {formatAmount(amount)}</button>
                                </div>
                                <p className="mock-note">Test Mode: All cards accepted</p>
                            </motion.div>
                        )}

                        {step === 'upi' && (
                            <motion.div
                                key="upi"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="payment-steps"
                            >
                                {!method && <div className="back-nav" onClick={() => setStep('options')}>← Back to Options</div>}
                                <div className="step-title" style={{ marginBottom: '20px' }}>UPI Identification</div>
                                <div className="mock-form">
                                    <div className="upi-input-wrapper">
                                        <input type="text" placeholder="UPI ID" value="success@vantage" readOnly />
                                    </div>
                                    <button className="pay-now-btn" onClick={handlePayment}>Pay {formatAmount(amount)}</button>
                                </div>
                                <div className="upi-apps">
                                    <span>GPay</span>
                                    <span>PhonePe</span>
                                    <span>Paytm</span>
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="processing-step"
                            >
                                <div className="mock-loader" />
                                <p>Verifying Payment...</p>
                                <span>Securing transaction with bank</span>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="processing-step"
                            >
                                <HiCheckCircle style={{ fontSize: '4rem', color: '#10b981' }} />
                                <p>Payment Successful!</p>
                                <span>Redirecting to your booking...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mock-payment-footer">
                    <p>Powered by <span>Vantage SecurePay</span></p>
                </div>
            </motion.div>
        </div>
    );
};

export default MockPaymentModal;
