{
type: "file",
fileName: "seshnx/webapp-main/webapp-main-236ddb9004a501645414af15ee480926c0cb06e0/src/components/PaymentsManager.jsx",
content: import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Check, Plus, Zap, TrendingUp, DollarSign, Loader2, Shield, Star, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { db, getPaths, app } from '../config/firebase'; 
import { SUBSCRIPTION_PLAN_KEYS } from '../config/constants';
import { useDynamicConfig } from '../hooks/useDynamicConfig';
import { handlePayout } from '../utils/paymentUtils';

export default function PaymentsManager({ user, userData }) {
  const [activeTab, setActiveTab] = useState('store'); 
  const [walletData, setWalletData] = useState({ balance: 0, escrowBalance: 0, payoutBalance: 0 });
  const [processing, setProcessing] = useState(false);
  
  const { tierData, tokenPackages, loading: loadingConfig } = useDynamicConfig(); 
  const functions = getFunctions(app);

  const currentTierId = userData?.currentTier || SUBSCRIPTION_PLAN_KEYS.FREE;
  
  // --- UPDATED: Comprehensive Role Check for Earnings Access ---
  const isTalent = userData?.accountTypes?.some(role => 
      ['Artist', 'Musician', 'Producer', 'Engineer', 'Studio', 'Composer', 'Technician', 'Label', 'Agent'].includes(role)
  );

  useEffect(() => {
      if (!user?.uid) return;
      const unsubWallet = onSnapshot(doc(db, getPaths(user.uid).userWallet), (snap) => {
          if (snap.exists()) {
              const data = snap.data();
              setWalletData({
                  balance: data.balance || 0,
                  escrowBalance: data.escrowBalance || 0,
                  payoutBalance: data.payoutBalance || 0 
              });
          }
      });
      return () => unsubWallet();
  }, [user.uid]);

  const handleCheckout = async (priceId, mode = 'payment') => {
      setProcessing(true);
      try {
          // Replaced SDK call with Cloud Function
          const createSession = httpsCallable(functions, 'createStripeCheckoutSession');
          const { data } = await createSession({
              price: priceId,
              mode: mode,
              success_url: window.location.href,
              cancel_url: window.location.href,
          });
          
          if (data && data.url) {
            window.location.assign(data.url);
          } else {
             throw new Error("Failed to create checkout session.");
          }

      } catch (error) {
          console.error("Checkout Error:", error);
          alert(`Checkout failed: ${error.message}`);
      } finally {
          setProcessing(false);
      }
  };

  const buyTokens = (pack) => {
      if (!pack.stripePriceId) return alert("Configuration Error: This package is missing a Stripe Price ID.");
      handleCheckout(pack.stripePriceId, 'payment');
  };

  const subscribeToPlan = (plan) => {
      if (!plan.stripePriceId) return alert("Configuration Error: This plan is missing a Stripe Price ID.");
      handleCheckout(plan.stripePriceId, 'subscription');
  };

  const initCashOut = async () => {
      if (!isTalent) return;
      if (walletData.payoutBalance <= 0) return alert("No funds available for cash out.");
      if (!window.confirm(`Cash out $${walletData.payoutBalance.toFixed(2)} to your connected account?`)) return;

      setProcessing(true);
      try {
          await handlePayout(walletData.payoutBalance);
          alert("Cash out initiated! Funds should arrive in your bank account shortly.");
      } catch (error) {
          alert(error.message);
      } finally {
          setProcessing(false);
      }
  };

  const sortedPlans = Object.values(tierData)
      .sort((a, b) => {
          if (a.id === currentTierId) return -1;
          if (b.id === currentTierId) return 1;
          return a.price - b.price;
      });

  const formatFee = (multiplier) => {
      const percentage = (multiplier - 1) * 100;
      if (percentage > 0) return `+${percentage.toFixed(0)}% Service Fee`;
      if (percentage === 0) return '0% Service Fee';
      return `-${Math.abs(percentage).toFixed(0)}% Fee (Discount)`;
  };

  return (
      <div className="max-w-6xl mx-auto p-4 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
              <div>
                  <h2 className="text-3xl font-extrabold dark:text-white flex items-center gap-2">
                      <DollarSign size={32} className="text-green-500" /> My Wallet
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Manage tokens, subscriptions, and earnings.</p>
              </div>
              
              <div className="flex gap-4">
                  <div className="bg-white dark:bg-[#2c2e36] px-5 py-3 rounded-2xl border dark:border-gray-700 shadow-sm flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-full">
                          <Zap fill="currentColor" className="text-yellow-500" size={20}/>
                      </div>
                      <div>
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Spending Tokens</div>
                          <div className="font-mono font-extrabold text-xl dark:text-white leading-none">{walletData.balance.toLocaleString()} TK</div>
                      </div>
                  </div>

                  {isTalent && (
                      <div className="bg-white dark:bg-[#2c2e36] px-5 py-3 rounded-2xl border dark:border-gray-700 shadow-sm flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-full">
                              <DollarSign className="text-green-500" size={20}/>
                          </div>
                          <div>
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Available USD</div>
                              <div className="font-mono font-extrabold text-xl dark:text-white leading-none">${walletData.payoutBalance.toFixed(2)}</div>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <div className="flex gap-4 border-b dark:border-gray-700 mb-8 overflow-x-auto">
             <button onClick={() => setActiveTab('store')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'store' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                 Token Store
             </button>
             <button onClick={() => setActiveTab('plans')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'plans' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                 Membership Plans
             </button>
             {isTalent && (
                 <button onClick={() => setActiveTab('earnings')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'earnings' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                     Earnings & Escrow
                 </button>
             )}
          </div>

          {activeTab === 'store' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-gradient-to-r from-brand-blue to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                      <div className="relative z-10 max-w-lg">
                          <h3 className="text-2xl font-bold mb-2">Power Up Your Creativity</h3>
                          <p className="opacity-90 mb-6">Use tokens to buy beats, presets, booking requests, and more on the SeshFx Marketplace.</p>
                      </div>
                      <Zap size={200} className="absolute -right-10 -bottom-20 text-white opacity-10 rotate-12 pointer-events-none" />
                  </div>
                  
                  {loadingConfig ? (
                      <div className="text-center py-20"><Loader2 className="animate-spin text-brand-blue mx-auto" size={32}/></div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {tokenPackages.map(pack => (
                              <div key={pack.id} className={`relative bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${pack.highlight ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'dark:border-gray-700'}`}>
                                  {pack.highlight && (
                                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wide shadow-sm">
                                          BEST VALUE
                                      </div>
                                  )}
                                  <div className="text-center mb-6">
                                      <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{pack.label}</div>
                                      <div className="text-5xl font-extrabold dark:text-white flex items-center justify-center gap-1">
                                          {pack.tokens}
                                          <span className="text-lg font-medium text-gray-400">TK</span>
                                      </div>
                                  </div>
                                  <button onClick={() => buyTokens(pack)} disabled={processing} className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${pack.highlight ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90'}`}>
                                    {processing ? <Loader2 className="animate-spin" size={18}/> : `Buy for $${pack.price}`}
                                  </button>
                              </div>
