import React, { useState } from 'react';
import {
  Search, MapPin, DollarSign, Star, Clock, Filter,
  Wrench, Briefcase, CheckCircle2, Shield, MessageCircle,
  ExternalLink, Sparkles, ChevronRight
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export interface TechSearchProps {
  user?: any;
  userData?: any;
  openPublicProfile?: (userId: string) => void;
  onRequestService?: (tech: any) => void;
}

const SPECIALTIES = [
  { id: 'all', label: 'All Specialties' },
  { id: 'Tube Amps', label: 'Tube & Preamps' },
  { id: 'Console Recap', label: 'Consoles & Outboard' },
  { id: 'Acoustic Calibration', label: 'Acoustics & Tuning' },
  { id: 'Soldering', label: 'Cabling & Patchbays' },
  { id: 'Tape Machines', label: 'Tape & Analog' },
];

export default function TechSearch({ user, userData, openPublicProfile, onRequestService }: TechSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [maxRate, setMaxRate] = useState<number | undefined>(undefined);

  const technicians = useQuery(api.techServices.getTechniciansDirectory, {
    searchQuery: searchQuery || undefined,
    specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
    maxRate: maxRate || undefined,
  }) || [];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technicians by name, specialty, skills, or location..."
              className="w-full bg-gray-50 dark:bg-[#252830] border border-gray-200 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-xs dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={maxRate || ''}
              onChange={(e) => setMaxRate(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-50 dark:bg-[#252830] border dark:border-gray-700 text-xs rounded-2xl px-3.5 py-3 font-semibold dark:text-white"
            >
              <option value="">Any Hourly Rate</option>
              <option value="75">Under $75/hr</option>
              <option value="100">Under $100/hr</option>
              <option value="150">Under $150/hr</option>
            </select>
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1">
          {SPECIALTIES.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSpecialty(s.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === s.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Technicians Grid */}
      {technicians.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto">
            <Wrench size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white">No certified technicians found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              Try broadening your specialty filter or clearing keywords.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {technicians.map((tech: any) => (
            <motion.div
              key={tech._id || tech.clerkId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-orange-500/40 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={tech.avatarUrl} name={tech.name} size="md" />
                    <div>
                      <h4 className="font-bold text-sm dark:text-white flex items-center gap-1.5">
                        <span>{tech.name}</span>
                        <span className="p-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-brand-blue" title="Verified Audio Tech">
                          <CheckCircle2 size={12} />
                        </span>
                      </h4>
                      <p className="text-xs text-orange-500 font-semibold">{tech.headline}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-[#252830] p-3 rounded-2xl text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-dark dark:text-white">{tech.rating}</span>
                    <span className="text-[11px] text-gray-400">({tech.completedJobs} jobs)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin size={12} />
                    <span>{tech.location}</span>
                  </div>
                  <div className="font-black text-orange-500">
                    ${tech.hourlyRate}/hr
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {tech.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tech.skills.slice(0, 3).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      {skill}
                    </span>
                  ))}
                  {tech.skills.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-lg text-[10px] text-gray-400">
                      +{tech.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t dark:border-gray-800">
                <button
                  onClick={() => openPublicProfile?.(tech.clerkId || tech._id)}
                  className="py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onRequestService?.(tech)}
                  className="py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition shadow-xs"
                >
                  Book Service
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
