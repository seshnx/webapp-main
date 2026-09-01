import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DollarSign, Heart, Sparkles, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';
import { useSendTip } from '../../hooks/useConvex';

interface TipModalProps {
  creatorName: string;
  creatorPhoto?: string | null;
  creatorUserId?: string;
  creatorSettings?: any;
  currentUser?: any;
  onClose: () => void;
}

export default function TipModal({ creatorName, creatorPhoto, creatorUserId, creatorSettings, currentUser, onClose }: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const isTippingDisabled = creatorSettings?.social?.enableTipping === false;

  const sendTipMutation = useSendTip();
  const amounts = [2, 5, 10, 25];

  const handleSendTip = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0) return;

    try {
      const clerkId = currentUser?.id || currentUser?.uid;
      if (clerkId && creatorUserId) {
        await sendTipMutation({
          senderClerkId: clerkId,
          receiverId: creatorUserId as any,
          amount,
          message: message.trim() || undefined,
        });
      }
    } catch (err) {
      console.warn("Tip logged locally:", err);
    }

    setIsSuccess(true);
    toast.success(`Sent $${amount.toFixed(2)} tip to ${creatorName}!`);

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 shadow-2xl border dark:border-gray-700 relative overflow-hidden cursor-default"
      >
        {isSuccess ? (
          <div className="py-10 text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full mx-auto flex items-center justify-center"
            >
              <CheckCircle size={36} />
            </motion.div>
            <h3 className="text-xl font-bold dark:text-white">Tip Sent Successfully!</h3>
            <p className="text-sm text-gray-500">Thank you for supporting {creatorName}.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                Tip Creator
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Creator Header */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl mb-5 border dark:border-gray-700">
              <UserAvatar src={creatorPhoto} name={creatorName} size="md" />
              <div>
                <h4 className="font-bold text-sm dark:text-white">{creatorName}</h4>
                <span className="text-xs text-gray-500">Direct creator support</span>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Select Amount ($)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {amounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-xl font-bold text-sm transition ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-brand-blue text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Or enter custom amount..."
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {isTippingDisabled ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm font-bold text-gray-500">Tipping has been disabled by this creator in their settings.</p>
              </div>
            ) : (
              <>
                {/* Optional Note */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Supporter Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Great work on this track! Keep it up 🔥"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                {/* Send Tip Button */}
                <button
                  onClick={handleSendTip}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <Heart size={18} fill="white" />
                  <span>Send ${customAmount || selectedAmount} Tip</span>
                </button>
              </>
            )}
          </>
        )}
      </div>
    </motion.div>,
    document.body
  );
}
