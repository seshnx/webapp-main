import React from 'react';
import { Mail, Phone, Globe, Lock } from 'lucide-react';

interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

interface KioskFooterProps {
  contact: ContactInfo;
  isLocked?: boolean;
  networkName?: string | null;
}

/**
 * Footer component for kiosk display
 * Shows contact information and lock status
 */
export default function KioskFooter({
  contact,
  isLocked = false,
  networkName,
}: KioskFooterProps) {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 hover:text-brand-blue transition-colors"
            >
              <Mail size={16} />
              <span>{contact.email}</span>
            </a>
          )}

          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 hover:text-brand-blue transition-colors"
            >
              <Phone size={16} />
              <span>{contact.phone}</span>
            </a>
          )}

          {contact.website && (
            <a
              href={contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-brand-blue transition-colors"
            >
              <Globe size={16} />
              <span>Website</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLocked ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
              <Lock size={12} />
              <span>Locked</span>
            </div>
          ) : networkName ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{networkName}</span>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
