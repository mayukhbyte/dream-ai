import React, { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Order, submitOrderPayment } from '@/lib/api';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [method, setMethod] = useState<'COD' | 'ONLINE' | 'UPI' | 'CARD'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(order.payment?.status === 'PAID');
  const [txId, setTxId] = useState<string>(order.payment?.transactionId || '');

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const generatedTx = `TXN-${Date.now().toString().slice(-6)}`;
      const res = await submitOrderPayment(order.id, {
        method,
        amount: order.rawPrice || 280,
        transactionId: generatedTx
      });
      setTxId(generatedTx);
      setIsPaid(true);
      onPaymentSuccess?.(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-orange-950/80 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isPaid ? 'Payment Confirmed' : 'Settle Delivery Bill'}
              </h3>
              <p className="text-xs text-zinc-400">Order #{order.id.slice(-6)} • {order.dish}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isPaid ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Payment Received Successfully</h4>
              <p className="text-xs text-zinc-300">
                Settled via <strong>{method === 'COD' ? 'Cash on Delivery (Cash Handed to Rider)' : 'Online Instant Gateway'}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-zinc-900 text-left font-mono text-xs text-zinc-300 space-y-1">
                <div>Amount: <strong className="text-white">{order.price}</strong></div>
                <div>Transaction ID: <span className="text-emerald-400">{txId}</span></div>
                <div>Status: <span className="text-emerald-400 font-bold">VERIFIED PAID</span></div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Close Receipt
              </button>
            </div>
          ) : (
            <>
              {/* Bill Summary */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block font-medium">Total Bill Amount</span>
                  <span className="text-2xl font-black text-white mt-0.5">{order.price}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PAYMENT DUE
                </span>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 block">
                  Select Preferred Payment Method
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setMethod('ONLINE')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col items-center gap-2 ${
                      method === 'ONLINE' || method === 'UPI' || method === 'CARD'
                        ? 'bg-orange-500/10 border-orange-500 text-white shadow-md shadow-orange-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-orange-400" />
                    <span className="text-xs font-bold">Online Mode</span>
                    <span className="text-[10px] text-zinc-500">UPI / Card / Net Banking</span>
                  </div>

                  <div
                    onClick={() => setMethod('COD')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col items-center gap-2 ${
                      method === 'COD'
                        ? 'bg-orange-500/10 border-orange-500 text-white shadow-md shadow-orange-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                    <span className="text-[10px] text-zinc-500">Pay cash upon arrival</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <Lock className="w-4 h-4" />
                {isProcessing 
                  ? 'Processing Settlement...' 
                  : method === 'COD' 
                  ? `Confirm Cash on Delivery (${order.price})` 
                  : `Pay Online Instant (${order.price})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
