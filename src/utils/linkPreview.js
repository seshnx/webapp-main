/**
 * Mock utility function to fetch link preview data.
 * In a real application, this would call a Firebase Function or external API
 * to safely scrape the OpenGraph metadata from the URL.
 */
export default async function getLinkPreview(url) {
    // Simple regex to extract the first full URL
    const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
    if (!urlMatch) {
        return null;
    }

    const matchedUrl = urlMatch[0];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const data = {
        url: matchedUrl,
        title: null,
        description: null,
        image: null,
    };

    // Mock logic based on URL content
    // UPDATED: Check for seshnx.net instead of seshnx.com
    if (matchedUrl.includes('seshnx.net')) {
        data.title = 'SeshNx Official Platform Link';
        data.description = 'Shared content from the SeshNx platform. Tap to view embed.';
        data.image = 'https://placehold.co/600x400/374151/f9fafb?text=SeshNx+Link';
    } else if (matchedUrl.includes('youtube.com')) {
        data.title = 'YouTube Video';
        data.description = 'Watch this video on YouTube.';
        // FIX: Removed markdown link wrapper which was breaking the <img> tag source
        data.image = 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'; // Placeholder
    } else if (matchedUrl.includes('spotify.com')) {
        data.title = 'New Track on Spotify';
        data.description = 'Listen to the latest release now!';
        data.image = 'https://placehold.co/600x400/1DB954/f9fafb?text=Spotify+Album';
    } else if (matchedUrl.includes('github.com')) {
        data.title = 'SeshNx WebApp Repository';
        data.description = 'Check out the source code and contribute.';
        data.image = 'https://placehold.co/600x400/000000/ffffff?text=GitHub';
    } else {
        // Generic fallback
        data.title = `External Link: ${matchedUrl}`;
        data.description = `Click to visit ${matchedUrl}.`;
    }

    return data;
}
