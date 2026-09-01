import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Sparkles, X, Heart, MessageCircle, DollarSign, Shield } from 'lucide-react';
import { useClerk } from '@clerk/react';
import { useNavigate } from 'react-router-dom';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignIn?: () => void;
  actionText?: string;
  creatorName?: string;
  postId?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  onConfirmSignIn,
  actionText = 'interact with this post',
  creatorName,
  postId,
}: AuthPromptModalProps) {
  const clerk = useClerk();
  const navigate = useNavigate();

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSignIn = () => {
    // 1. Store the post ID in session storage for context on login
    if (postId) {
      sessionStorage.setItem('seshnx_pending_post_modal', postId);
    }
    
    // 2. Close the parent shared post modal
    if (onConfirmSignIn) {
      onConfirmSignIn();
    } else {
      onClose();
    }

    // 3. Initiate authentication flow
    if (clerk?.openSignIn) {
      clerk.openSignIn();
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100002] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white relative overflow-hidden cursor-default"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand-blue/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-blue bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                SeshNx Creator Community
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Sign In to Join the Conversation
              </h3>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-5">
            {creatorName
              ? `You need a SeshNx account to ${actionText} from ${creatorName}. Connect with artists, producers, and audio engineers today!`
              : `Create an account or sign in to ${actionText}, share audio tracks, and collaborate with creators.`}
          </p>

          {/* Quick Perks */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-2.5 text-center">
              <Heart size={16} className="text-rose-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-gray-300 block">Reactions</span>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-2.5 text-center">
              <MessageCircle size={16} className="text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-gray-300 block">Comments</span>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-2.5 text-center">
              <DollarSign size={16} className="text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-gray-300 block">Direct Tips</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleSignIn}
              className="w-full py-3 px-4 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              <LogIn size={16} />
              <span>Sign In / Create Account</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-gray-400 hover:text-white font-semibold transition"
            >
              Continue Browsing as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
