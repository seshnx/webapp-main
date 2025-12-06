import React, { useState, useEffect, useRef } from 'react';
// UPDATED IMPORTS: Added 'increment' for atomic transactions
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs, where, increment } from 'firebase/firestore';
import { Search, Disc, Sliders, Download, ShoppingCart, CheckCircle, Zap, Plus, X, Upload, Loader2, FileAudio, Image as ImageIcon, Play, Pause, Volume2, Info, Music, Tag } from 'lucide-react';
import { db, getPaths, appId } from '../config/firebase';
import { useMediaUpload } from '../hooks/useMediaUpload';
import StarFieldVisualizer from './shared/StarFieldVisualizer';

export default function SeshFxMarketplace({ user, userData, tokenBalance, refreshWallet }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [ownedItemIds, setOwnedItemIds] = useState(new Set());
  
  // UI State
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // For Detail View
  
  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState(null); // { url, title, author, cover }
  
  // 1. Fetch Market Items
  useEffect(() => {
      const q = query(collection(db, getPaths(user.uid).marketplaceItems), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
  }, [user.uid]);

  // 2. Fetch Owned Items
  useEffect(() => {
      if (!user?.uid) return;
      const q = collection(db, getPaths(user.uid).userLibrary);
      const unsubscribe = onSnapshot(q, (snapshot) => {
          setOwnedItemIds(new Set(snapshot.docs.map(doc => doc.data().itemId)));
      });
      return () => unsubscribe();
  }, [user?.uid]);

  const handlePurchase = async (item) => {
      // Client-side check for UI feedback only (Server rules should also enforce this)
      if (tokenBalance < item.price) {
          alert("Insufficient tokens! Please top up in the Billing tab.");
          return;
      }
      
      if(!confirm(`Purchase ${item.title} for ${item.price} Tokens?`)) return;
      
      try {
          // FINANCIAL FIX: Use atomic increment(-price) instead of setting absolute value
          // This prevents race conditions where a user could spend the same tokens twice.
          const walletRef = doc(db, getPaths(user.uid).userWallet); 
          await updateDoc(walletRef, { balance: increment(-item.price) });
          
          await addDoc(collection(db, getPaths(user.uid).userLibrary), {
              itemId: item.id,
              title: item.title,
              type: item.type,
              pricePaid: item.price,
              purchaseDate: serverTimestamp(),
              downloadUrl: item.downloadUrl 
          });
          
          if(refreshWallet) refreshWallet();
      } catch(e) { console.error(e); alert("Transaction failed."); }
  };

  const handleDownload = (item) => {
      if (!ownedItemIds.has(item.id)) return;
      window.open(item.downloadUrl, '_blank');
  };

  const filteredItems = items.filter(i => 
      (filter === 'All' || i.type === filter) && 
      i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto relative pb-32">
      {/* Header & Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                  <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2 uppercase tracking-widest text-xs">
                      <Zap size={14} fill="currentColor"/> SeshFx Marketplace
                  </div>
                  <h1 className="text-4xl font-extrabold mb-2">Discover Your Sound</h1>
                  <p className="text-slate-400 max-w-lg">The premier destination for high-quality samples, presets, and beats from top creators.</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl flex items-center gap-3">
                      <div className="text-right">
                          <div className="text-xs text-slate-300 font-medium">My Balance</div>
                          <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">{tokenBalance} <span className="text-sm text-white font-normal">TK</span></div>
                      </div>
                      <button onClick={() => document.querySelector('[data-nav="payments"]').click()} className="bg-yellow-500 text-black p-2 rounded-lg hover:bg-yellow-400 transition"><Plus size={20}/></button>
                  </div>
                  <button onClick={() => setShowSellModal(true)} className="bg-brand-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition">
                      <Upload size={18} /> Creator Studio
                  </button>
              </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 z-20 bg-[#f7fbff] dark:bg-[#1f2128] py-4 transition-colors">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {['All', 'Presets', 'Samples', 'Beats'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === f ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:bg-gray-50'}`}>
                      {f}
                  </button>
              ))}
          </div>
          <div className="ml-auto relative w-full md:w-96">
              <Search className="absolute left-4 top-3 text-gray-400" size={18}/>
              <input 
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none shadow-sm"
                placeholder="Search packs, tags, or creators..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
              const isOwned = ownedItemIds.has(item.id);
              return (
                <div key={item.id} className="group bg-white dark:bg-dark-card rounded-2xl border dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer" onClick={() => setSelectedItem(item)}>
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-tr from-blue-500 to-purple-600">
                             {item.type === 'Presets' ? <Sliders size={48} className="opacity-50 text-white"/> : <Disc size={48} className="opacity-50 text-white"/>}
                        </div>
                        {isOwned && <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"><CheckCircle size={10}/> OWNED</div>}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm">View Details</div>
                        </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <div className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">{item.type}</div>
                            <div className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{item.tags?.[0]}</div>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate cursor-pointer hover:text-brand-blue transition" onClick={() => setSelectedItem(item)}>{item.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">by {item.author}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-3 border-t dark:border-gray-700">
                            {isOwned ? (
                                <button onClick={() => handleDownload(item)} className="flex-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 rounded-lg text-sm font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition flex items-center justify-center gap-2"><Download size={16}/> Download</button>
                            ) : (
                                <>
                                    <div className="text-lg font-extrabold dark:text-white flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div> {item.price}</div>
                                    <button onClick={() => handlePurchase(item)} className="bg-gray-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition flex items-center gap-2">Buy Now</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
              );
          })}
      </div>

      {/* Modals */}
      {showSellModal && <SellItemModal user={user} userData={userData} onClose={() => setShowSellModal(false)} />}
      {selectedItem && (
          <ItemDetailModal 
            item={selectedItem} 
            isOwned={ownedItemIds.has(selectedItem.id)} 
            user={user} 
            onClose={() => setSelectedItem(null)} 
            onBuy={() => handlePurchase(selectedItem)} 
            onDownload={() => handleDownload(selectedItem)} 
          />
      )}
    </div>
  );
}

/* --- CREATOR STUDIO MODAL --- */
function SellItemModal({ user, userData, onClose }) {
    const [form, setForm] = useState({ title: '', price: '', type: 'Presets', tags: '', description: '' });
    const [audioFile, setAudioFile] = useState(null);
    const [status, setStatus] = useState('');
    const { uploadMedia, uploading } = useMediaUpload();

    const handleSubmit = async () => {
        if(!form.title || !form.price || !audioFile) return alert("Title, Price, and Audio File are required.");
        
        try {
            setStatus('Uploading Audio Asset...');
            // Single file upload serves as both preview and product for now
            const downloadUrl = await uploadMedia(audioFile, getPaths(user.uid).marketAssets);

            setStatus('Listing Item...');
            await addDoc(collection(db, getPaths(user.uid).marketplaceItems), {
                ...form,
                price: parseInt(form.price),
                tags: form.tags.split(',').map(t => t.trim()),
                author: `${userData.firstName} ${userData.lastName}`,
                authorId: user.uid,
                downloadUrl, // This URL acts as both source and download
                timestamp: serverTimestamp()
            });
            
            setStatus('Success!');
            setTimeout(onClose, 1000);
        } catch(e) { console.error(e); setStatus('Error'); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-2xl font-bold dark:text-white">Creator Studio</h2><p className="text-gray-500 text-sm">List a new sound for sale</p></div>
                    <button onClick={onClose}><X/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Title</label><input className="w-full p-3 border rounded-xl dark:bg-dark-bg-primary dark:border-gray-600 dark:text-white" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="e.g. Midnight Lofi" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Type</label><select className="w-full p-3 border rounded-xl dark:bg-dark-bg-primary dark:border-gray-600 dark:text-white" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}><option>Presets</option><option>Samples</option><option>Beats</option></select></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Price (TK)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-dark-bg-primary dark:border-gray-600 dark:text-white" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} /></div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Description</label><textarea className="w-full p-3 border rounded-xl dark:bg-dark-bg-primary dark:border-gray-600 dark:text-white" rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} /></div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="border-2 border-dashed dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition relative bg-blue-50/50 dark:bg-blue-900/10 h-full flex flex-col justify-center items-center">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" onChange={e=>setAudioFile(e.target.files[0])} />
                            <Music size={48} className="mx-auto text-blue-500 mb-2"/>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{audioFile ? audioFile.name : "Upload Audio File"}</div>
                            <div className="text-xs text-gray-500 mt-2">MP3/WAV (Max 50MB)</div>
                            {audioFile && <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Selected</div>}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={handleSubmit} disabled={uploading} className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                        {uploading ? <><Loader2 className="animate-spin"/> {status}</> : "List Item for Sale"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* --- ITEM DETAIL PREVIEW MODAL --- */
function ItemDetailModal({ item, isOwned, onClose, onBuy, onDownload }) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-[600px]">
                {/* Left: Visuals */}
                <div className="md:w-5/12 bg-gray-100 dark:bg-black/40 relative p-8 flex flex-col justify-center items-center text-center">
                     <div className="w-64 h-64 bg-gradient-to-br from-brand-blue to-purple-600 rounded-lg shadow-2xl mb-6 flex items-center justify-center text-white">
                        {item.type === 'Presets' ? <Sliders size={80}/> : <Disc size={80}/>}
                     </div>
                     <h2 className="text-2xl font-bold dark:text-white mb-2">{item.title}</h2>
                     <div className="text-brand-blue font-medium mb-6">by {item.author}</div>
                     
                     {/* Large Preview Player with TRUNCATION */}
                     {item.downloadUrl && (
                         <div className="w-full">
                             {/* Passes isOwned check to enable/disable truncation logic in visualizer */}
                             <StarFieldVisualizer audioUrl={item.downloadUrl} fileName="Preview Track" previewMode={!isOwned} />
                         </div>
                     )}
                </div>
                
                {/* Right: Info */}
                <div className="md:w-7/12 p-8 overflow-y-auto flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{item.type}</span>
                            <h1 className="text-3xl font-extrabold dark:text-white mt-2">{item.title}</h1>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X/></button>
                    </div>

                    <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300 mb-8">
                        <p>{item.description || "No description provided by the creator."}</p>
                        {!isOwned && <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-yellow-800 dark:text-yellow-200 text-xs flex items-center gap-2"><Lock size={14}/> Audio preview is truncated to 15 seconds. Purchase to unlock full track.</div>}
                    </div>

                    <div className="mt-auto">
                        {isOwned ? (
                            <button onClick={onDownload} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]">
                                <Download size={24}/> Download Now
                            </button>
                        ) : (
                            <button onClick={onBuy} className="w-full bg-gray-900 dark:bg-white dark:text-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-transform hover:scale-[1.02]">
                                <span>Buy for</span>
                                <span className="bg-yellow-400 text-black px-2 py-0.5 rounded text-sm flex items-center gap-1"><Zap size={12} fill="black"/> {item.price}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
