/**
 * Contract Templates Configuration
 *
 * Defines contract templates for different label-artist agreements.
 * Each template contains:
 * - name: Display name
 * - description: Brief description of the contract type
 * - category: Contract category (recording, publishing, licensing, etc.)
 * - template: The contract text with placeholder variables
 * - variables: Array of variable names used in the template
 * - fields: Form field definitions for each variable
 */

export const CONTRACT_TEMPLATES = {
  // Recording Contracts
  RECORDING_360: {
    id: 'recording_360',
    name: '360 Recording Deal',
    category: 'recording',
    description: 'Comprehensive 360 deal where label participates in all revenue streams',
    template: `RECORDING AGREEMENT (360 DEAL)

This Agreement is made on {{contract_date}} by and between:

{{label_name}} ("Label"), a {{label_state}} corporation with its principal place of business at {{label_address}}, {{label_city}}, {{label_state}} {{label_zip}},

And

{{artist_legal_name}} ("Artist"), residing at {{artist_address}}, {{artist_city}}, {{artist_state}} {{artist_zip}}.

1. TERM
The term of this Agreement shall be {{term_years}} year(s), commencing on {{start_date}} and ending on {{end_date}}.

2. TERRITORY
The territory covered by this Agreement shall be {{territory}}.

3. GRANT OF RIGHTS
Artist hereby grants Label the exclusive right to:
   (a) Record, manufacture, and distribute sound recordings of Artist's performances
   (b) Exploit Artist's name, likeness, and biography for promotional purposes
   (c) License recordings to third parties for synchronization, streaming, and other uses
   (d) Participate in merchandise sales and touring revenue ({{merch_split}}% to Label)
   (e) Participate in publishing and songwriter royalties ({{publishing_split}}% to Label)

4. ROYALTY RATES
   (a) Master Royalty: {{master_royalty}}% of wholesale price for physical sales
   (b) Streaming Royalty: {{streaming_royalty}}% of gross revenue
   (c) Publishing Royalty: {{publishing_royalty}}% of publisher's share
   (d) Merchandise Royalty: {{merch_royalty}}% of net sales
   (e) Touring Royalty: {{touring_royalty}}% of net profits

5. ADVANCE
Label shall pay to Artist an advance of ${{advance_amount}} ("Advance") upon execution of this Agreement. The Advance shall be recoupable from all royalties due to Artist.

6. RECORDING COMMITMENT
Artist agrees to deliver:
   - {{album_commitment}} album(s) during the term
   - Minimum {{tracks_per_album}} tracks per album
   - All recordings shall be Artist's original compositions

7. MARKETING AND PROMOTION
Label agrees to spend a minimum of ${{marketing_commitment}} on marketing and promotion for each release.

8. ACCOUNTING
Label shall furnish Artist with quarterly statements of account. Royalties shall be paid quarterly within {{payment_days}} days after close of each quarter.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________
{{label_name}}

_________________________
{{artist_legal_name}}`,
    variables: [
      'contract_date',
      'label_name',
      'label_state',
      'label_address',
      'label_city',
      'label_zip',
      'artist_legal_name',
      'artist_address',
      'artist_city',
      'artist_state',
      'artist_zip',
      'term_years',
      'start_date',
      'end_date',
      'territory',
      'merch_split',
      'publishing_split',
      'master_royalty',
      'streaming_royalty',
      'publishing_royalty',
      'merch_royalty',
      'touring_royalty',
      'advance_amount',
      'album_commitment',
      'tracks_per_album',
      'marketing_commitment',
      'payment_days'
    ],
    fields: {
      contract_date: {
        label: 'Contract Date',
        type: 'date',
        required: true,
        default: new Date().toISOString().split('T')[0]
      },
      label_name: {
        label: 'Label Name',
        type: 'text',
        required: true
      },
      label_state: {
        label: 'Label State of Incorporation',
        type: 'text',
        required: true
      },
      label_address: {
        label: 'Label Street Address',
        type: 'text',
        required: true
      },
      label_city: {
        label: 'Label City',
        type: 'text',
        required: true
      },
      label_state: {
        label: 'Label State',
        type: 'text',
        required: true
      },
      label_zip: {
        label: 'Label ZIP Code',
        type: 'text',
        required: true
      },
      artist_legal_name: {
        label: 'Artist Legal Name',
        type: 'text',
        required: true
      },
      artist_address: {
        label: 'Artist Street Address',
        type: 'text',
        required: true
      },
      artist_city: {
        label: 'Artist City',
        type: 'text',
        required: true
      },
      artist_state: {
        label: 'Artist State',
        type: 'text',
        required: true
      },
      artist_zip: {
        label: 'Artist ZIP Code',
        type: 'text',
        required: true
      },
      term_years: {
        label: 'Contract Term (Years)',
        type: 'number',
        required: true,
        default: 3
      },
      start_date: {
        label: 'Start Date',
        type: 'date',
        required: true
      },
      end_date: {
        label: 'End Date',
        type: 'date',
        required: true
      },
      territory: {
        label: 'Territory',
        type: 'text',
        required: true,
        default: 'Worldwide'
      },
      merch_split: {
        label: 'Merchandise Split (%)',
        type: 'number',
        required: true,
        default: 15
      },
      publishing_split: {
        label: 'Publishing Split (%)',
        type: 'number',
        required: true,
        default: 50
      },
      master_royalty: {
        label: 'Master Royalty (%)',
        type: 'number',
        required: true,
        default: 15
      },
      streaming_royalty: {
        label: 'Streaming Royalty (%)',
        type: 'number',
        required: true,
        default: 50
      },
      publishing_royalty: {
        label: 'Publishing Royalty (%)',
        type: 'number',
        required: true,
        default: 50
      },
      merch_royalty: {
        label: 'Merchandise Royalty (%)',
        type: 'number',
        required: true,
        default: 15
      },
      touring_royalty: {
        label: 'Touring Royalty (%)',
        type: 'number',
        required: true,
        default: 10
      },
      advance_amount: {
        label: 'Advance Amount ($)',
        type: 'number',
        required: true,
        default: 0
      },
      album_commitment: {
        label: 'Album Commitment',
        type: 'number',
        required: true,
        default: 2
      },
      tracks_per_album: {
        label: 'Tracks Per Album',
        type: 'number',
        required: true,
        default: 10
      },
      marketing_commitment: {
        label: 'Marketing Commitment ($)',
        type: 'number',
        required: true,
        default: 10000
      },
      payment_days: {
        label: 'Payment Days After Quarter',
        type: 'number',
        required: true,
        default: 60
      }
    }
  },

  RECORDING_TRADITIONAL: {
    id: 'recording_traditional',
    name: 'Traditional Recording Deal',
    category: 'recording',
    description: 'Standard recording deal focusing on master recordings only',
    template: `RECORDING AGREEMENT (TRADITIONAL)

This Agreement is made on {{contract_date}} by and between:

{{label_name}} ("Label")
And
{{artist_legal_name}} ("Artist")

1. TERM
{{term_years}} year(s), from {{start_date}} to {{end_date}}.

2. EXCLUSIVE RECORDING SERVICES
Artist agrees to render exclusive recording services to Label for the term.

3. ROYALTY PROVISIONS
   (a) Physical Sales: {{physical_royalty}}% of wholesale price
   (b) Digital Sales: {{digital_royalty}}% of gross receipts
   (c) Streaming: {{streaming_royalty}}% of gross revenue
   (d) Synchronization: {{sync_royalty}}% of gross receipts

4. ADVANCE
Label shall pay Artist an advance of ${{advance_amount}}, recoupable from royalties.

5. RECORDING COMMITMENT
{{album_commitment}} albums minimum, with {{tracks_per_album}} tracks each.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_________________________
{{label_name}}

_________________________
{{artist_legal_name}}`,
    variables: [
      'contract_date',
      'label_name',
      'artist_legal_name',
      'term_years',
      'start_date',
      'end_date',
      'physical_royalty',
      'digital_royalty',
      'streaming_royalty',
      'sync_royalty',
      'advance_amount',
      'album_commitment',
      'tracks_per_album'
    ],
    fields: {
      contract_date: { label: 'Contract Date', type: 'date', required: true },
      label_name: { label: 'Label Name', type: 'text', required: true },
      artist_legal_name: { label: 'Artist Legal Name', type: 'text', required: true },
      term_years: { label: 'Term (Years)', type: 'number', required: true, default: 3 },
      start_date: { label: 'Start Date', type: 'date', required: true },
      end_date: { label: 'End Date', type: 'date', required: true },
      physical_royalty: { label: 'Physical Royalty (%)', type: 'number', required: true, default: 15 },
      digital_royalty: { label: 'Digital Royalty (%)', type: 'number', required: true, default: 20 },
      streaming_royalty: { label: 'Streaming Royalty (%)', type: 'number', required: true, default: 50 },
      sync_royalty: { label: 'Sync Royalty (%)', type: 'number', required: true, default: 50 },
      advance_amount: { label: 'Advance Amount ($)', type: 'number', required: true, default: 0 },
      album_commitment: { label: 'Album Commitment', type: 'number', required: true, default: 1 },
      tracks_per_album: { label: 'Tracks Per Album', type: 'number', required: true, default: 10 }
    }
  },

  DISTRIBUTION: {
    id: 'distribution',
    name: 'Distribution Agreement',
    category: 'distribution',
    description: 'Distribution-only deal where label distributes artist\'s masters',
    template: `DISTRIBUTION AGREEMENT

This Agreement is made on {{contract_date}} between:

{{label_name}} ("Distributor")
And
{{artist_legal_name}} ("Artist")

1. SERVICES
Distributor agrees to distribute Artist's recordings to digital service providers and physical retailers.

2. TERM
{{term_years}} year(s), from {{start_date}} to {{end_date}}.

3. REVENUE SHARE
Artist shall receive: {{revenue_share}}% of all revenues generated.

4. DEDUCTIONS
Distributor may deduct {{distribution_fee}}% for distribution costs and expenses.

5. PAYMENTS
Payments shall be made monthly within {{payment_days}} days of month-end.

IN WITNESS WHEREOF...

_________________________
{{label_name}}

_________________________
{{artist_legal_name}}`,
    variables: [
      'contract_date',
      'label_name',
      'artist_legal_name',
      'term_years',
      'start_date',
      'end_date',
      'revenue_share',
      'distribution_fee',
      'payment_days'
    ],
    fields: {
      contract_date: { label: 'Contract Date', type: 'date', required: true },
      label_name: { label: 'Distributor Name', type: 'text', required: true },
      artist_legal_name: { label: 'Artist Legal Name', type: 'text', required: true },
      term_years: { label: 'Term (Years)', type: 'number', required: true, default: 2 },
      start_date: { label: 'Start Date', type: 'date', required: true },
      end_date: { label: 'End Date', type: 'date', required: true },
      revenue_share: { label: 'Revenue Share (%)', type: 'number', required: true, default: 85 },
      distribution_fee: { label: 'Distribution Fee (%)', type: 'number', required: true, default: 15 },
      payment_days: { label: 'Payment Days', type: 'number', required: true, default: 45 }
    }
  },

  PUBLISHING: {
    id: 'publishing',
    name: 'Publishing Agreement',
    category: 'publishing',
    description: 'Songwriting and publishing rights agreement',
    template: `PUBLISHING AGREEMENT

This Agreement is made on {{contract_date}} between:

{{label_name}} ("Publisher")
And
{{artist_legal_name}} ("Songwriter")

1. GRANT OF COPYRIGHT
Songwriter assigns to Publisher {{copyright_share}}% of all copyrights in compositions created during the term.

2. TERM
{{term_years}} year(s), from {{start_date}}.

3. TERRITORY
{{territory}}.

4. ROYALTY PROVISIONS
   (a) Mechanical Royalties: {{mechanical_royalty}}% of statutory rate
   (b) Performance Royalties: {{performance_royalty}}% of collected
   (c) Synchronization: {{sync_royalty}}% of gross receipts

IN WITNESS WHEREOF...

_________________________
{{label_name}}

_________________________
{{artist_legal_name}}`,
    variables: [
      'contract_date',
      'label_name',
      'artist_legal_name',
      'copyright_share',
      'term_years',
      'start_date',
      'territory',
      'mechanical_royalty',
      'performance_royalty',
      'sync_royalty'
    ],
    fields: {
      contract_date: { label: 'Contract Date', type: 'date', required: true },
      label_name: { label: 'Publisher Name', type: 'text', required: true },
      artist_legal_name: { label: 'Songwriter Legal Name', type: 'text', required: true },
      copyright_share: { label: 'Copyright Share (%)', type: 'number', required: true, default: 50 },
      term_years: { label: 'Term (Years)', type: 'number', required: true, default: 3 },
      start_date: { label: 'Start Date', type: 'date', required: true },
      territory: { label: 'Territory', type: 'text', required: true, default: 'Worldwide' },
      mechanical_royalty: { label: 'Mechanical Royalty (%)', type: 'number', required: true, default: 50 },
      performance_royalty: { label: 'Performance Royalty (%)', type: 'number', required: true, default: 50 },
      sync_royalty: { label: 'Sync Royalty (%)', type: 'number', required: true, default: 50 }
    }
  }
};

/**
 * Get template by ID
 */
export const getTemplateById = (id) => {
  return CONTRACT_TEMPLATES[id.toUpperCase()] || null;
};

/**
 * Get all templates by category
 */
export const getTemplatesByCategory = (category) => {
  return Object.values(CONTRACT_TEMPLATES).filter(
    template => template.category === category
  );
};

/**
 * Get all template categories
 */
export const getTemplateCategories = () => {
  const categories = new Set(
    Object.values(CONTRACT_TEMPLATES).map(t => t.category)
  );
  return Array.from(categories);
};

/**
 * Replace variables in template with values
 */
export const fillTemplate = (templateText, values) => {
  let filledText = templateText;

  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    filledText = filledText.split(placeholder).join(value || '');
  });

  return filledText;
};
