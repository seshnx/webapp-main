import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

// Cache for link previews to avoid repeated API calls
const previewCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch link preview data using Firebase Function.
 * Falls back to smart client-side inference if the function is unavailable.
 */
export default async function getLinkPreview(url) {
    // Simple regex to extract the first full URL
    const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
    if (!urlMatch) {
        return null;
    }

    const matchedUrl = urlMatch[0];

    // Check cache first
    const cached = previewCache.get(matchedUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    // Try Firebase Function first
    try {
        const functions = getFunctions(app);
        const getLinkPreviewFn = httpsCallable(functions, 'getLinkPreview');
        const result = await getLinkPreviewFn({ url: matchedUrl });
        
        if (result.data) {
            // Cache the result
            previewCache.set(matchedUrl, { data: result.data, timestamp: Date.now() });
            return result.data;
        }
    } catch (error) {
        console.warn('Firebase getLinkPreview unavailable, using fallback:', error.message);
    }

    // Fallback to smart client-side inference
    const data = await getClientSideLinkPreview(matchedUrl);
    previewCache.set(matchedUrl, { data, timestamp: Date.now() });
    return data;
}

/**
 * Client-side link preview with smart inference for known platforms.
 */
async function getClientSideLinkPreview(url) {
    const data = {
        url: url,
        title: null,
        description: null,
        image: null,
        siteName: null
    };

    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        // YouTube
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            let videoId = null;
            if (hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            } else {
                videoId = urlObj.searchParams.get('v');
            }
            
            data.siteName = 'YouTube';
            data.title = 'YouTube Video';
            data.description = 'Watch this video on YouTube';
            if (videoId) {
                data.image = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        }
        // Spotify
        else if (hostname.includes('spotify.com')) {
            data.siteName = 'Spotify';
            data.title = 'Spotify Content';
            data.description = 'Listen on Spotify';
            data.image = 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png';
        }
        // SoundCloud
        else if (hostname.includes('soundcloud.com')) {
            data.siteName = 'SoundCloud';
            data.title = 'SoundCloud Track';
            data.description = 'Listen on SoundCloud';
            data.image = 'https://soundcloud.com/press/assets/press-kit/soundcloud-logo.png';
        }
        // GitHub
        else if (hostname.includes('github.com')) {
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            data.siteName = 'GitHub';
            data.title = pathParts.length >= 2 ? `${pathParts[0]}/${pathParts[1]}` : 'GitHub Repository';
            data.description = 'View on GitHub';
            if (pathParts.length >= 2) {
                data.image = `https://opengraph.githubassets.com/1/${pathParts[0]}/${pathParts[1]}`;
            }
        }
        // Twitter/X
        else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
            data.siteName = 'X (Twitter)';
            data.title = 'Tweet';
            data.description = 'View on X';
        }
        // Instagram
        else if (hostname.includes('instagram.com')) {
            data.siteName = 'Instagram';
            data.title = 'Instagram Post';
            data.description = 'View on Instagram';
        }
        // SeshNx internal links
        else if (hostname.includes('seshnx.net') || hostname.includes('seshnx.com')) {
            data.siteName = 'SeshNx';
            data.title = 'SeshNx Link';
            data.description = 'View on SeshNx platform';
            data.image = 'https://seshnx.net/pwa-512x512.png';
        }
        // LinkedIn
        else if (hostname.includes('linkedin.com')) {
            data.siteName = 'LinkedIn';
            data.title = 'LinkedIn Post';
            data.description = 'View on LinkedIn';
        }
        // Apple Music
        else if (hostname.includes('music.apple.com')) {
            data.siteName = 'Apple Music';
            data.title = 'Apple Music';
            data.description = 'Listen on Apple Music';
        }
        // TikTok
        else if (hostname.includes('tiktok.com')) {
            data.siteName = 'TikTok';
            data.title = 'TikTok Video';
            data.description = 'Watch on TikTok';
        }
        // Vimeo
        else if (hostname.includes('vimeo.com')) {
            data.siteName = 'Vimeo';
            data.title = 'Vimeo Video';
            data.description = 'Watch on Vimeo';
        }
        // Bandcamp
        else if (hostname.includes('bandcamp.com')) {
            const subdomain = hostname.split('.')[0];
            data.siteName = 'Bandcamp';
            data.title = subdomain !== 'bandcamp' ? `${subdomain} on Bandcamp` : 'Bandcamp';
            data.description = 'Listen on Bandcamp';
        }
        // Generic fallback
        else {
            data.siteName = hostname.replace('www.', '');
            data.title = hostname.replace('www.', '');
            data.description = `Visit ${hostname}`;
        }

        return data;
    } catch (e) {
        console.warn('Link preview parsing error:', e);
        return {
            url: url,
            title: url,
            description: null,
            image: null
        };
    }
}
