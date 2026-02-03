import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Preview data for embedded content
 */
interface PreviewData {
    title?: string;
    description?: string;
    thumbnail?: string;
    [key: string]: any;
}

/**
 * Props for SeshNxEmbedModal component
 */
export interface SeshNxEmbedModalProps {
    /** The SeshNx URL to be embedded */
    url: string;
    /** Controls the modal visibility */
    isOpen: boolean;
    /** Function to close the modal */
    onClose: () => void;
    /** Pre-fetched metadata about the link */
    previewData?: PreviewData;
}

/**
 * SeshNxEmbedModal Component
 *
 * A modal to embed and display content (like a profile or session detail)
 * shared via a SeshNx platform link, without leaving the chat interface.
 *
 * @example
 * <SeshNxEmbedModal
 *   url="https://seshnx.com/profile/123"
 *   isOpen={showEmbed}
 *   onClose={() => setShowEmbed(false)}
 *   previewData={{ title: 'John Doe - Profile' }}
 * />
 */
export default function SeshNxEmbedModal({
    url,
    isOpen,
    onClose,
    previewData
}: SeshNxEmbedModalProps) {
    if (!isOpen || !url) return null;

    // Determine the type of content for better display titles
    const contentPath = new URL(url).pathname;
    let contentType = 'Content';
    if (contentPath.startsWith('/profile/')) {
        contentType = 'User Profile';
    } else if (contentPath.startsWith('/session/')) {
        contentType = 'Session Details';
    } else if (contentPath.startsWith('/studio/')) {
        contentType = 'Studio Listing';
    }

    // Determine the actual title to display
    const title = previewData?.title || `${contentType} Preview`;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose} // Close on backdrop click
        >
            <div
                className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl h-3/4 max-h-[800px] flex flex-col transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl sticky top-0">
                    <h3 className="text-xl font-bold text-white truncate max-w-[80%]">{title}</h3>
                    <div className="flex items-center space-x-2">
                        {/* Open in new tab button */}
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
                                <ExternalLink className="w-5 h-5" />
                            </Button>
                        </a>
                        {/* Close button */}
                        <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Modal Content - Placeholder for actual embedded view */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-gray-400 flex flex-col items-center justify-center text-center">
                    <p className="mb-4 text-lg font-medium text-white">Embedded Content Simulation</p>
                    <p className="mb-2">This is where the actual SeshNx content (e.g., profile card, session details) would be rendered, based on the URL:</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all p-2 bg-gray-700 rounded-lg text-sm">
                        {url}
                    </a>
                    <p className="mt-4 text-sm">In a real implementation, you would use a dedicated component (e.g., `ProfileCard id="..."`) here instead of an iframe to display the content securely and natively.</p>
                </div>

                {/* Modal Footer */}
                <div className="p-3 border-t border-gray-700 bg-gray-800 rounded-b-xl flex justify-end">
                    <Button onClick={onClose} variant="secondary">Done</Button>
                </div>
            </div>
        </div>
    );
}
