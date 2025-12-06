import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Search, Disc, Sliders, Download, CheckCircle, Zap, Plus, X, Upload, Loader2, Music, Flag } from 'lucide-react';
import { db, getPaths } from '../../config/firebase';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import StarFieldVisualizer from '../shared/StarFieldVisualizer';
import ReportModal from '../ReportModal'; 

export default function SeshFxStore({ user, userData, tokenBalance, refreshWallet }) { 
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [ownedItemIds, setOwnedItemIds] = useState(new Set());
  
  // UI State
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [reportTarget, setReportTarget] = useState(null); 
  
  // 1. Fetch Market Items
  useEffect(() => {
      if (!user?.uid) return;
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
      if (tokenBalance < item.price) {
          alert("Insufficient tokens! Please top up.");
          return;
      }
      
      if(!window.confirm(`Purchase ${item.title} for ${item.price} Tokens?`)) return;
      
      try {
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
          alert("Purchased successfully!");
      } catch(e) { 
          console.error(e); 
          alert("Transaction failed."); 
      }
  };

  const filteredItems = items.filter(i => 
      (filter === 'All' || i.type === filter) && 
      i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-32">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {['All', 'Presets', 'Samples', 'Beats'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === f ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                      {f}
                  </button>
              ))}
          </div>
          <div className="ml-auto flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                  <input 
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card text-sm dark:text-white focus:outline-none"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
              </div>
              <button onClick={() => setShowSellModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-green-700">
                  <Upload size={16} /> Upload
              </button>
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
              const isOwned = ownedItemIds.has(item.id);
              return (
                <div key={item.id} className="bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-lg transition flex flex-col group">
                    <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer" onClick={() => setSelectedItem(item)}>
                        {item.type === 'Presets' ? <Sliders size={40} className="text-gray-400"/> : <Disc size={40} className="text-gray-400"/>}
                        {isOwned && <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle size={8}/> OWNED</div>}
                    </div>
                    
                    <div className="p-3 flex flex-col flex-1">
                        <div className="text-[10px] font-bold text-brand-blue uppercase mb-1">{item.type}</div>
                        <h4 className="font-bold text-sm dark:text-white truncate mb-1" title={item.title}>{item.title}</h4>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                <Zap size={10} fill="currentColor"/> {item.price}
                            </span>
                            {!isOwned && (
                                <button onClick={() => handlePurchase(item)} className="bg-gray-900 dark:bg-white dark:text-black text-white px-3 py-1 rounded text-[10px] font-bold hover:opacity-80">
                                    Buy
                                </button>
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
            onReport={() => setReportTarget({
                id: selectedItem.id,
                type: 'market_item',
                summary: selectedItem.title
            })}
          />
      )}
      
      {/* Report Modal */}
      {reportTarget && (
          <ReportModal 
              user={user} 
              target={reportTarget} 
              onClose={() => setReportTarget(null)} 
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
    const { uploadMedia, uploading } = useMediaUpload(); // Destructure uploading

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
                tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
                author: `${userData.firstName} ${userData.lastName}`,
                authorId: user.uid,
                downloadUrl, // This URL acts as both source and download
                timestamp: serverTimestamp()
            });
            
            setStatus('Success!');
            setTimeout(onClose, 1000);
        } catch(e) { 
            console.error(e); 
            setStatus('Error listing item.');
            alert("Failed to submit item to market. Check console.");
        }
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
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Title</label><input className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="e.g. Midnight Lofi" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Type</label><select className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}><option>Presets</option><option>Samples</option><option>Beats</option></select></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Price (TK)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} /></div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Description</label><textarea className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Tags (Comma Separated)</label><input className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} placeholder="lofi, hiphop, boom-bap" /></div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="border-2 border-dashed dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition relative bg-blue-50/50 dark:bg-blue-900/10 h-full flex flex-col justify-center items-center">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" onChange={e=>setAudioFile(e.target.files[0])} />
                            <Music size={48} className="mx-auto text-blue-500 mb-2"/>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{audioFile ? audioFile.name : "Upload Audio File (Product Asset)"}</div>
                            <div className="text-xs text-gray-500 mt-2">MP3/WAV (Max 50MB)</div>
                            {audioFile && <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Selected</div>}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button 
                        onClick={handleSubmit} 
                        disabled={uploading || !form.title || !form.price || !audioFile} 
                        className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {uploading ? <><Loader2 className="animate-spin"/> {status}</> : "List Item for Sale"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* --- ITEM DETAIL PREVIEW MODAL --- */
function ItemDetailModal({ item, isOwned, onClose, onBuy, onDownload, onReport }) {
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
                        <div className="flex gap-2">
                            <button 
                                onClick={onReport} 
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition"
                                title="Report Violation"
                            >
                                <Flag size={20}/>
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20}/></button>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300 mb-8">
                        <p>{item.description || "No description provided by the creator."}</p>
                        {!isOwned && <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-yellow-800 dark:text-yellow-200 text-xs flex items-center gap-2"><Info size={14}/> Audio preview is truncated to 15 seconds. Purchase to unlock full track.</div>}
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
