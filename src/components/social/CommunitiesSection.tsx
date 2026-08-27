import React, { useState } from 'react';
import { Users, Plus, Check, MessageSquare, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface CommunityItem {
  id: string;
  name: string;
  category: string;
  description: string;
  membersCount: number;
  isJoined: boolean;
  coverImage: string;
}

export default function CommunitiesSection() {
  const [communities, setCommunities] = useState<CommunityItem[]>([
    {
      id: 'comm-1',
      name: 'Hip-Hop & Trap Producers Hub',
      category: 'Production',
      description: 'Exclusive circle for beatmakers, sample chop discussion, and sound kit swaps.',
      membersCount: 4280,
      isJoined: true,
      coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'comm-2',
      name: 'Vocalists & Lyricists Network',
      category: 'Vocal Performance',
      description: 'Find topliners, vocal producers, and collaborate on hooks & choruses.',
      membersCount: 2150,
      isJoined: false,
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'comm-3',
      name: 'Mixing & Mastering Engineers Circle',
      category: 'Audio Engineering',
      description: 'DAW routing, analog gear reviews, stems feedback, and loudness standards.',
      membersCount: 3890,
      isJoined: false,
      coverImage: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=600&q=80',
    }
  ]);

  const toggleJoin = (id: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          isJoined: !c.isJoined,
          membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <Users className="text-brand-blue" size={22} />
            Creator Communities & Circles
          </h3>
          <p className="text-xs text-gray-500">Join specialized groups to collaborate and share work.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {communities.map(comm => (
          <motion.div
            key={comm.id}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden border dark:border-gray-700 shadow-sm flex flex-col justify-between"
          >
            <div className="h-28 relative overflow-hidden bg-gray-900">
              <img src={comm.coverImage} alt={comm.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-bold">
                {comm.category}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm dark:text-white mb-1">{comm.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{comm.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-500">
                  {comm.membersCount.toLocaleString()} members
                </span>

                <button
                  onClick={() => toggleJoin(comm.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    comm.isJoined
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      : 'bg-brand-blue text-white hover:bg-blue-600'
                  }`}
                >
                  {comm.isJoined ? (
                    <>
                      <Check size={14} /> Joined
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Join Circle
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
