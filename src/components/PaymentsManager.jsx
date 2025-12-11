import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
// import { httpsCallable } from 'firebase/functions';
import { Check, Plus, Zap, TrendingUp, DollarSign, Loader2, Shield, Star, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { db, getPaths } from '../config/firebase';
// import { functions } from '../config/firebase'; // TEMPORARILY DISABLED 
import { SUBSCRIPTION_PLAN_KEYS } from '../config/constants';
import { useDynamicConfig } from '../hooks/useDynamicConfig';
import { handlePayout } from '../utils/paymentUtils';

export default function PaymentsManager({ user, userData }) {
  const [activeTab, setActiveTab] = useState('store'); 
  const [walletData, setWalletData] = useState({ balance: 0, escrowBalance: 0, payoutBalance: 0 });
  const [processing, setProcessing] = useState(false);
  
  const { tierData, tokenPackages, loading: loadingConfig } = useDynamicConfig(); 

  const currentTierId = userData?.currentTier || SUBSCRIPTION_PLAN_KEYS.FREE;
  
  // --- UPDATED: Comprehensive Role Check for Earnings Access ---
  const isTalent = userData?.accountTypes?.some(role => 
      ['Talent', 'Producer', 'Engineer', 'Studio', 'Composer', 'Technician', 'Label', 'Agent'].includes(role)
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
          // TEMPORARILY DISABLED: Firebase Functions not available
          throw new Error("Checkout functionality is temporarily unavailable. Firebase Functions service is not configured.");
          
          /* // Use exported functions instance
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
          } */

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
                          ))}
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'plans' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center max-w-2xl mx-auto mb-8">
                      <h3 className="text-2xl font-bold dark:text-white mb-2">Upgrade Your Workflow</h3>
                      <p className="text-gray-500 dark:text-gray-400">Unlock lower fees, unlimited bookings, and premium visibility.</p>
                  </div>

                  {loadingConfig ? (
                      <div className="text-center py-10"><Loader2 className="animate-spin text-brand-blue mx-auto" size={24}/></div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                          {sortedPlans.map(plan => {
                              const isCurrent = plan.id === currentTierId;
                              return (
                                  <div key={plan.id} className={`bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border flex flex-col ${isCurrent ? 'border-brand-blue ring-1 ring-brand-blue' : 'dark:border-gray-700'} shadow-sm`}>
                                      {isCurrent && <div className="text-xs font-bold text-brand-blue uppercase tracking-wide mb-2 flex items-center gap-1"><Star size={12} fill="currentColor"/> Current Plan</div>}
                                      <h3 className="text-xl font-bold dark:text-white mb-1">{plan.name}</h3>
                                      <div className="text-3xl font-extrabold mb-6 dark:text-white">
                                          ${plan.price}<span className="text-sm font-normal text-gray-500">/mo</span>
                                      </div>
                                      <div className="space-y-3 mb-8 flex-1">
                                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                                              <DollarSign size={16} className={plan.feeMultiplier <= 1.0 ? 'text-green-500' : 'text-gray-400'} />
                                              {formatFee(plan.feeMultiplier)}
                                          </div>
                                          {plan.features.map((feat, i) => (
                                              <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                  <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                                                  <span>{feat}</span>
                                              </div>
                                          ))}
                                      </div>
                                      <button onClick={() => subscribeToPlan(plan)} className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors mt-auto ${isCurrent ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-default' : 'bg-brand-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20'}`} disabled={isCurrent || processing}>
                                          {isCurrent ? 'Active' : (processing ? <Loader2 className="animate-spin mx-auto"/> : 'Upgrade')}
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'earnings' && isTalent && (
              <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Summary Header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                              <h3 className="text-lg font-medium opacity-90">Total Lifetime Earnings</h3>
                              <div className="text-4xl font-extrabold mt-1">
                                  ${(walletData.payoutBalance + walletData.escrowBalance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                                  <div className="text-white/70 text-xs">Pending</div>
                                  <div className="font-bold">${walletData.escrowBalance.toFixed(2)}</div>
                              </div>
                              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                                  <div className="text-white/70 text-xs">Available</div>
                                  <div className="font-bold">${walletData.payoutBalance.toFixed(2)}</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Escrow/Pending */}
                      <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm relative overflow-hidden">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><Lock size={24}/></div>
                              <div><h3 className="font-bold dark:text-white">Pending in Escrow</h3><p className="text-xs text-gray-500 dark:text-gray-400">Held for active gigs/sessions</p></div>
                          </div>
                          <div className="text-4xl font-extrabold dark:text-white mb-4">${walletData.escrowBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                          
                          {/* Earnings Breakdown */}
                          <div className="border-t dark:border-gray-700 pt-4 mt-4 space-y-2">
                              <div className="text-xs font-bold text-gray-500 uppercase mb-2">How Escrow Works</div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Client books you → Funds held in escrow
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Complete the session → Mark as done
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  24 hours later → Released to Available
                              </div>
                          </div>
                          
                          <div className="text-xs bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 p-3 rounded-lg flex items-start gap-2 mt-4"><AlertCircle size={14} className="mt-0.5 shrink-0"/> Funds are released 24 hours after session completion.</div>
                      </div>

                      {/* Available for Payout */}
                      <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border border-green-500/30 shadow-lg relative overflow-hidden">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><DollarSign size={24}/></div>
                              <div><h3 className="font-bold dark:text-white">Ready to Cash Out</h3><p className="text-xs text-gray-500 dark:text-gray-400">Cleared funds - transfer anytime</p></div>
                          </div>
                          <div className="text-4xl font-extrabold text-green-600 dark:text-green-400 mb-2">${walletData.payoutBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                          
                          {/* Fee Info */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 text-xs">
                              <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
                                  <span>Platform Fee (1%)</span>
                                  <span className="text-red-500">-${(walletData.payoutBalance * 0.01).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1 border-t dark:border-gray-700">
                                  <span>You'll Receive</span>
                                  <span className="text-green-600">${(walletData.payoutBalance * 0.99).toFixed(2)}</span>
                              </div>
                          </div>
                          
                          <button onClick={initCashOut} disabled={processing || walletData.payoutBalance <= 0} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none">
                              {processing ? <Loader2 className="animate-spin" size={20}/> : <>Cash Out Now <ArrowRight size={20}/></>}
                          </button>
                          <div className="text-[10px] text-center text-gray-400 mt-3">Transfers via Stripe Connect to your bank in 2-3 days.</div>
                      </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white dark:bg-[#2c2e36] p-5 rounded-2xl border dark:border-gray-700">
                      <h4 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                          <TrendingUp size={18} className="text-brand-blue" /> Earnings Tips
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><Star size={16}/></div>
                              <div>
                                  <div className="font-medium dark:text-white">Complete Your Profile</div>
                                  <div className="text-xs text-gray-500">Add demos & set your rates to get booked faster</div>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Zap size={16}/></div>
                              <div>
                                  <div className="font-medium dark:text-white">Check Open Gigs</div>
                                  <div className="text-xs text-gray-500">Browse broadcasts for immediate opportunities</div>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><Shield size={16}/></div>
                              <div>
                                  <div className="font-medium dark:text-white">Build Trust</div>
                                  <div className="text-xs text-gray-500">Great reviews = more bookings & better rates</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
}
