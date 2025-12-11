import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Zap, Music, PenTool, Clock, ChevronDown, Loader2, MapPin, Link as LinkIcon, DollarSign, Calendar } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { GENRE_DATA, INSTRUMENT_DATA, ACCOUNT_TYPES } from '../config/constants';
import StudioMap from './shared/StudioMap';
import LocationPicker from './shared/LocationPicker'; 
import { useEquipmentDatabase } from '../hooks/useEquipmentDatabase';
import { fetchZipLocation } from '../utils/geocode';

export default function BroadcastRequest({ user, userData, onBack, onSuccess }) {
  const { loading: equipLoading, data: equipData, categories: equipCats } = useEquipmentDatabase();

  // --- MAP & LOCATION STATE ---
  const [broadcastRangeIndex, setBroadcastRangeIndex] = useState(2); 
  const rangeValues = [5, 10, 15, 25, 50, 100, 250, 500];
  const currentRange = rangeValues[broadcastRangeIndex];
  
  const [location, setLocation] = useState({ lat: 34.0522, lng: -118.2437, name: 'Default' });

  // Initialize location from user data or GPS
  useEffect(() => {
      const initLocation = async () => {
          if (userData?.zip) {
              const loc = await fetchZipLocation(userData.zip);
              if (loc) {
                  setLocation({ lat: loc.lat, lng: loc.lng, name: loc.cityState });
                  return;
              }
          }
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(pos => {
                  setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Current Location' });
              });
          }
      };
      initLocation();
  }, [userData]);

  const handleLocationUpdate = (loc) => {
      if (loc.lat && loc.lng) {
          setLocation({ lat: loc.lat, lng: loc.lng, name: loc.cityState || 'Selected Location' });
      }
  };

  // --- CORE REQUEST STATE ---
  const [role, setRole] = useState('Talent');
  const [action, setAction] = useState('Play');
  const [instrument, setInstrument] = useState('');
  const [genre, setGenre] = useState('');
  const [title, setTitle] = useState('');

  // --- NEW FIELDS ---
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [budget, setBudget] = useState('');
  
  // --- 3 NEW FEATURES ---
  const [references, setReferences] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Any');
  const [paymentType, setPaymentType] = useState('Flat Rate');

  // --- MODIFIERS ---
  const [needs, setNeeds] = useState([
      { id: Date.now(), type: 'General', value: '' }
  ]);

  const availableRoles = ACCOUNT_TYPES.filter(t => t !== 'Technician');

  const getActionsForRole = (r) => {
      switch(r) {
          case 'Talent': return [
              // Vocal-focused
              'Sing Lead Vocals', 'Sing Background/Harmonies', 'Feature on Track', 'Write Topline/Melody',
              // Instrumentalist-focused
              'Play Instrument', 'Session Recording', 'Live Performance', 'Tour Support',
              // DJ-focused
              'DJ Set', 'DJ Private Event', 'DJ Club Night',
              // General
              'Record Demo', 'Collaborate', 'Improvise', 'Teach/Lesson'
          ];
          case 'Engineer': return [
              'Mix Track', 'Mix Album/EP', 'Master Track', 'Master Album', 
              'Record/Track Session', 'Edit/Comp', 'Tune Vocals', 
              'Sound Design', 'Dolby Atmos Mix', 'Live Sound/FOH'
          ];
          case 'Producer': return [
              'Produce Full Track', 'Co-Produce', 'Remix', 'Create Custom Beat',
              'Arrange/Program', 'Vocal Production', 'Toplining', 
              'Beat Lease', 'Beat Exclusive', 'Sound Design'
          ];
          case 'Studio': return [
              'Host Recording Session', 'Host Mixing Session', 'Rent Rehearsal Space',
              'Rent Gear/Backline', 'Full Day Lockout', 'Podcast Recording'
          ];
          case 'Composer': return [
              'Compose Original Score', 'Arrange Song', 'Orchestrate', 
              'Write Library Music', 'Create Jingle', 'Score Film/TV',
              'Score Video Game', 'Ghostwrite'
          ];
          case 'Label': return ['Sign Artist', 'Distribution Deal', 'Licensing'];
          case 'Agent': return ['Book Artist', 'Negotiate Deal', 'Represent'];
          default: return ['Work', 'Collaborate', 'Consult'];
      }
  };

  const addNeed = () => setNeeds([...needs, { id: Date.now(), type: 'Gear', value: '', gearSelection: {} }]);
  
  const removeNeed = (id) => {
      if (needs.length === 1) return; 
      setNeeds(needs.filter(n => n.id !== id));
  };

  const updateNeed = (id, field, newValue) => setNeeds(needs.map(n => n.id === id ? { ...n, [field]: newValue } : n));

  const updateGearSelection = (id, level, value) => {
      setNeeds(needs.map(n => {
          if (n.id !== id) return n;
          const newSelection = { ...n.gearSelection, [level]: value };
          if (level === 'category') { delete newSelection.subCategory; delete newSelection.type; delete newSelection.item; }
          if (level === 'subCategory') { delete newSelection.type; delete newSelection.item; }
          if (level === 'type') { delete newSelection.item; }
          return { ...n, gearSelection: newSelection, value: value };
      }));
  };

  // Actions that require an instrument selection
  const instrumentRequiredActions = ['Play Instrument', 'Session Work'];
  const needsInstrument = role === 'Talent' && instrumentRequiredActions.includes(action);

  const sendBroadcast = async () => {
      if(!title || !genre) return alert("Please complete the request sentence.");
      if(needsInstrument && !instrument) return alert("Please select an instrument.");

      const validNeeds = needs.filter(n => n.value.trim() !== '');
      
      let serviceString = `${role} - ${action}`;
      if (instrument) serviceString += ` ${instrument}`;

      try {
          await addDoc(collection(db, `artifacts/${appId}/public/data/bookings`), {
              senderId: user.uid, 
              senderName: "Broadcast Request", 
              targetId: "BROADCAST",
              targetName: title,
              role, action, instrument: instrument || null, genre,
              serviceType: serviceString,
              
              // New Fields
              date: date || 'Flexible', 
              time: time || 'Flexible',
              offerAmount: budget ? parseInt(budget) : null,
              references,
              experienceLevel,
              paymentType,

              requirements: validNeeds,
              message: validNeeds.map(n => `[${n.type}] ${n.value}`).join('\n'),
              range: currentRange,
              status: 'Broadcasting', 
              type: 'Broadcast', 
              location: { lat: location.lat, lng: location.lng },
              timestamp: serverTimestamp()
          });
          
          alert(`Broadcast sent to ${role}s within ${currentRange} miles!`);
          onSuccess();
      } catch(e) {
          console.error(e);
          alert("Failed to send broadcast.");
      }
  };

  const needTypes = [
      { label: 'Gear / Equipment', value: 'Gear', icon: Settings },
      { label: 'Technique / Skill', value: 'Technique', icon: Zap },
      { label: 'Feel / Vibe', value: 'Vibe', icon: Music },
      { label: 'Logistics', value: 'Logistics', icon: Clock },
      { label: 'General Note', value: 'General', icon: PenTool },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-brand-blue"><MapPin size={24} /></div>
              <div><h3 className="text-2xl font-bold dark:text-white">Broadcast Builder</h3><p className="text-sm text-gray-500">Reach professionals in your area.</p></div>
          </div>
          <button onClick={onBack} className="text-sm font-medium text-gray-500 hover:text-brand-blue transition">Cancel & Exit</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Map Column */}
          <div className="lg:col-span-4 space-y-5">
              <div className="bg-gray-50 dark:bg-[#1f2128] p-5 rounded-2xl border dark:border-gray-700">
                  <LocationPicker 
                      initialZip={userData?.zip} 
                      onLocationChange={handleLocationUpdate} 
                      label="Broadcast Center"
                  />
                  
                  <div className="mt-4 flex justify-between items-center mb-2">
                      <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Range</label>
                      <span className="bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded-md">{currentRange} Miles</span>
                  </div>
                  
                  <div className="mb-5 rounded-xl overflow-hidden border dark:border-gray-600 shadow-md relative h-48">
                      <StudioMap center={[location.lat, location.lng]} zoom={9} height="100%" drawRadius={true} radiusMiles={currentRange}/>
                  </div>
                  <input type="range" min="0" max={rangeValues.length - 1} value={broadcastRangeIndex} onChange={(e) => setBroadcastRangeIndex(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-blue" />
              </div>
          </div>

          {/* Builder Column */}
          <div className="lg:col-span-8 space-y-8">
              {/* UPDATED: Dark mode background set to gray-800 for readability */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-blue-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue"></div>
                  <label className="text-xs font-extrabold text-brand-blue uppercase tracking-widest mb-4 block">Step 1: Core Request</label>
                  <div className="flex flex-wrap items-center gap-3 text-lg md:text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                      <span>I need a</span>
                      <div className="relative inline-block">
                          {/* UPDATED: Inputs use gray-700 bg in dark mode */}
                          <select value={role} onChange={e => { setRole(e.target.value); setAction(getActionsForRole(e.target.value)[0]); }} className="appearance-none bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-white font-bold py-1 pl-3 pr-8 rounded-lg border-b-2 border-blue-200 dark:border-gray-600 focus:outline-none cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 transition">{availableRoles.map(t => <option key={t} value={t}>{t}</option>)}</select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 dark:text-gray-400 pointer-events-none" size={16}/>
                      </div>
                      <span>that can</span>
                      <div className="relative inline-block">
                          <select value={action} onChange={e => setAction(e.target.value)} className="appearance-none bg-purple-50 dark:bg-gray-700 text-purple-700 dark:text-white font-bold py-1 pl-3 pr-8 rounded-lg border-b-2 border-purple-200 dark:border-gray-600 focus:outline-none cursor-pointer hover:bg-purple-100 dark:hover:bg-gray-600 transition">{getActionsForRole(role).map(a => <option key={a} value={a}>{a}</option>)}</select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-500 dark:text-gray-400 pointer-events-none" size={16}/>
                      </div>
                      {needsInstrument && (
                          <div className="relative inline-block">
                              <select value={instrument} onChange={e => setInstrument(e.target.value)} className="appearance-none bg-green-50 dark:bg-gray-700 text-green-700 dark:text-white font-bold py-1 pl-3 pr-8 rounded-lg border-b-2 border-green-200 dark:border-gray-600 focus:outline-none cursor-pointer hover:bg-green-100 dark:hover:bg-gray-600 transition"><option value="">(Select Instrument)</option>{Object.entries(INSTRUMENT_DATA).map(([category, instruments]) => (<optgroup key={category} label={category}>{instruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}</optgroup>))}</select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 dark:text-gray-400 pointer-events-none" size={16}/>
                          </div>
                      )}
                      <span>for a song in the</span>
                      <div className="relative inline-block">
                          <select value={genre} onChange={e => setGenre(e.target.value)} className="appearance-none bg-orange-50 dark:bg-gray-700 text-orange-700 dark:text-white font-bold py-1 pl-3 pr-8 rounded-lg border-b-2 border-orange-200 dark:border-gray-600 focus:outline-none cursor-pointer hover:bg-orange-100 dark:hover:bg-gray-600 transition"><option value="">(Select Genre)</option>{GENRE_DATA.map(g => <option key={g} value={g}>{g}</option>)}</select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 dark:text-gray-400 pointer-events-none" size={16}/>
                      </div>
                  </div>
                  <div className="mt-6 pt-4 border-t dark:border-gray-700">
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Project Title</label>
                      <input className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-lg p-3 text-gray-700 dark:text-gray-200 font-medium placeholder-gray-400 focus:ring-2 focus:ring-brand-blue" placeholder="e.g. Summer Hit Single - Drum Tracking" value={title} onChange={e => setTitle(e.target.value)}/>
                  </div>
              </div>

              {/* Logistics & Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#1f2128] p-5 rounded-xl border dark:border-gray-700">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Logistics</label>
                      <div className="space-y-3">
                          <div className="flex gap-2">
                              <div className="flex-1">
                                  <label className="text-[10px] text-gray-400 uppercase">Date</label>
                                  <input type="date" className="w-full p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={date} onChange={e => setDate(e.target.value)}/>
                              </div>
                              <div className="flex-1">
                                  <label className="text-[10px] text-gray-400 uppercase">Time</label>
                                  <input type="time" className="w-full p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={time} onChange={e => setTime(e.target.value)}/>
                              </div>
                          </div>
                          <div>
                              <label className="text-[10px] text-gray-400 uppercase">Budget ($)</label>
                              <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 text-green-500" size={14}/>
                                  <input type="number" className="w-full pl-8 p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm font-bold" placeholder="Flexible" value={budget} onChange={e => setBudget(e.target.value)}/>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-[#1f2128] p-5 rounded-xl border dark:border-gray-700">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Project Details</label>
                      <div className="space-y-3">
                          <div>
                              <label className="text-[10px] text-gray-400 uppercase">Payment Type</label>
                              <select className="w-full p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={paymentType} onChange={e => setPaymentType(e.target.value)}>
                                  <option>Flat Rate</option>
                                  <option>Hourly</option>
                                  <option>Royalty Split</option>
                                  <option>Trade / Barter</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] text-gray-400 uppercase">Experience Required</label>
                              <select className="w-full p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
                                  <option>Any</option>
                                  <option>Intermediate</option>
                                  <option>Pro / Expert</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] text-gray-400 uppercase">Reference Link</label>
                              <div className="relative">
                                  <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={14}/>
                                  <input className="w-full pl-8 p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" placeholder="Spotify / SoundCloud..." value={references} onChange={e => setReferences(e.target.value)}/>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white dark:bg-[#1f2128] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-end mb-4">
                      <label className="text-xs font-extrabold text-brand-blue uppercase tracking-widest">Step 2: Specific Needs</label>
                      <button onClick={addNeed} className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition"><Plus size={14}/> Add Condition</button>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                      {needs.map((need) => (
                          <div key={need.id} className="flex flex-col sm:flex-row gap-2 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border dark:border-gray-700 animate-in slide-in-from-bottom-2">
                              <div className="w-full sm:w-1/3 min-w-[140px]">
                                  <select className="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2c2e36] dark:text-white focus:ring-2 focus:ring-brand-blue outline-none" value={need.type} onChange={(e) => updateNeed(need.id, 'type', e.target.value)}>
                                      {needTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                  </select>
                              </div>

                              <div className="flex-1 flex gap-2">
                                  {need.type === 'Gear' && !equipLoading ? (
                                      <div className="flex flex-col gap-2 w-full">
                                          <select className="w-full p-2 text-xs border rounded bg-white dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white" value={need.gearSelection?.category || ''} onChange={(e) => updateGearSelection(need.id, 'category', e.target.value)}>
                                              <option value="">Select Category...</option>
                                              {equipCats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                          </select>
                                          {need.gearSelection?.category && equipData[need.gearSelection.category] && (
                                                  <select className="w-full p-2 text-xs border rounded bg-white dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white" value={need.gearSelection?.subCategory || ''} onChange={(e) => updateGearSelection(need.id, 'subCategory', e.target.value)}>
                                                      <option value="">Select Type...</option>
                                                      {Object.keys(equipData[need.gearSelection.category]).map(key => <option key={key} value={key}>{key.replace(/_/g, ' ')}</option>)}
                                                  </select>
                                              )}
                                              {need.gearSelection?.subCategory && (
                                                  <select className="w-full p-2 text-xs border rounded bg-white dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white" value={need.gearSelection?.type || ''} onChange={(e) => updateGearSelection(need.id, 'type', e.target.value)}>
                                                      <option value="">Select Subtype...</option>
                                                      {Object.keys(equipData[need.gearSelection.category][need.gearSelection.subCategory]).map(key => <option key={key} value={key}>{key.replace(/_/g, ' ')}</option>)}
                                                  </select>
                                              )}
                                              {need.gearSelection?.type && (
                                                  <select className="w-full p-2 text-sm font-bold border-l-4 border-brand-blue rounded bg-white dark:bg-[#2c2e36] dark:border-gray-600 dark:text-white shadow-sm" value={need.gearSelection?.item || ''} onChange={(e) => updateGearSelection(need.id, 'item', e.target.value)}>
                                                      <option value="">Select Specific Item...</option>
                                                      {equipData[need.gearSelection.category][need.gearSelection.subCategory][need.gearSelection.type].map(item => <option key={item} value={item}>{item}</option>)}
                                                  </select>
                                              )}
                                      </div>
                                  ) : (
                                      <input className="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2c2e36] dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-blue" placeholder="Describe requirement..." value={need.value} onChange={(e) => updateNeed(need.id, 'value', e.target.value)} />
                                  )}
                                  <button onClick={() => removeNeed(need.id)} className="text-gray-400 hover:text-red-500 px-2"><Trash2 size={18}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="h-6 w-0.5 bg-gray-200 dark:bg-gray-700 mx-auto my-2"></div>
                  <button className="w-full bg-gradient-to-r from-brand-blue to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.01] transition-all text-lg flex items-center justify-center gap-2" onClick={sendBroadcast}><Zap fill="currentColor" size={20} /> Broadcast Opportunity</button>
              </div>
          </div>
      </div>
    </div>
  );
}
