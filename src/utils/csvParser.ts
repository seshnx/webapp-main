// src/utils/csvParser.ts

interface RoyaltyEntry {
  isrc: string;
  trackTitle: string;
  store: string;
  territory: string;
  streams: number;
  earnings: number;
  period: string;
}

interface RoyaltyParseResult {
  items: RoyaltyEntry[];
  summary: {
    totalEarnings: number;
    totalStreams: number;
    rowCount: number;
  };
}

/**
 * Simulates parsing a complex DSP Royalty Report (Spotify/Apple style).
 */
export const parseRoyaltyCSV = (file: File): Promise<RoyaltyParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error('Failed to read file'));
        return;
      }

      const lines = text.split('\n');
      const parsedData: RoyaltyEntry[] = [];
      let totalEarnings = 0;
      let totalStreams = 0;

      // Skipping header, process rows
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length < 5) continue; // Skip empty/malformed rows

        // Mock Mapping: Assumes columns 0=ISRC, 1=Title, 2=Store, 3=Country, 4=Streams, 5=Royalties
        const entry: RoyaltyEntry = {
          isrc: row[0]?.trim() || 'UNKNOWN',
          trackTitle: row[1]?.trim() || 'Untitled Track',
          store: row[2]?.trim() || 'Other',
          territory: row[3]?.trim() || 'WW',
          streams: parseInt(row[4]) || 0,
          earnings: parseFloat(row[5]) || 0,
          period: new Date().toISOString().slice(0, 7) // YYYY-MM
        };

        totalEarnings += entry.earnings;
        totalStreams += entry.streams;
        parsedData.push(entry);
      }

      resolve({
        items: parsedData,
        summary: {
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          totalStreams,
          rowCount: parsedData.length
        }
      });
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

/**
 * Generates a dummy CSV for testing purposes so users can try the feature immediately.
 */
export const generateSampleCSV = (): string => {
  const rows: string[][] = [
    ['ISRC', 'Track Title', 'Store', 'Country', 'Streams', 'Earnings ($)'],
    ['US-S1X-24-00001', 'Midnight City', 'Spotify', 'US', '1500', '4.50'],
    ['US-S1X-24-00001', 'Midnight City', 'Apple Music', 'US', '800', '6.40'],
    ['US-S1X-24-00002', 'Neon Drive', 'Spotify', 'UK', '2200', '6.60'],
    ['US-S1X-24-00002', 'Neon Drive', 'TikTok', 'BR', '5000', '1.50'],
    ['US-S1X-24-00003', 'Deep Focus', 'Amazon', 'DE', '300', '1.20'],
    ['US-S1X-24-00001', 'Midnight City', 'Spotify', 'JP', '450', '1.35']
  ];
  return rows.map(r => r.join(',')).join('\n');
};
