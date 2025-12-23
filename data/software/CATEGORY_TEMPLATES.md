# Software Database Category Templates

This document lists the recommended JSON files to create for the software database, organized by category.

## File Structure

Each JSON file should follow this structure:

```json
{
  "Category Name": {
    "Subcategory 1": [
      "Developer Software Name",
      "Another Developer Another Software"
    ],
    "Subcategory 2": [
      "Developer Software Name"
    ]
  }
}
```

## Required Files

### 1. `daws.json` ✅ (Created)
**Category**: DAWs
**Subcategories**: Desktop DAWs, Mobile DAWs, Cloud/Web DAWs

### 2. `plugins_effects.json` ✅ (Created)
**Category**: Audio Effects Plugins
**Subcategories**: 
- EQ Plugins
- Compressor Plugins
- Reverb Plugins
- Delay Plugins
- Distortion/Saturation Plugins
- Modulation Plugins
- Pitch/Time Plugins
- Utility Plugins

### 3. `plugins_instruments.json` (To Create)
**Category**: Virtual Instruments
**Subcategories**:
- Synthesizers
- Samplers
- Drum Machines
- Orchestral Libraries
- String Libraries
- Brass Libraries
- Woodwind Libraries
- Percussion Libraries
- Piano Libraries
- Guitar Libraries
- Bass Libraries
- Vocal Libraries
- World Instruments
- Electronic Instruments

### 4. `plugins_mastering.json` (To Create)
**Category**: Mastering Tools
**Subcategories**:
- Mastering Suites
- Mastering EQ
- Mastering Compressors
- Mastering Limiters
- Loudness Meters
- Spectrum Analyzers
- Stereo Imaging Tools
- Dithering Tools

### 5. `plugins_restoration.json` (To Create)
**Category**: Audio Restoration
**Subcategories**:
- Noise Reduction
- Click Removal
- De-Reverb
- De-Hum
- Spectral Repair
- Audio Repair Suites

### 6. `sample_libraries.json` (To Create)
**Category**: Sample Libraries
**Subcategories**:
- Drum Samples
- Loop Libraries
- One-Shot Samples
- Construction Kits
- Acoustic Samples
- Electronic Samples

### 7. `notation.json` (To Create)
**Category**: Music Notation
**Subcategories**:
- Desktop Notation Software
- Mobile Notation Apps
- Tablature Software

### 8. `live_performance.json` (To Create)
**Category**: Live Performance
**Subcategories**:
- DJ Software
- Live Looping
- Live Performance DAWs
- MIDI Controllers Software
- Backing Track Players

### 9. `audio_analysis.json` (To Create)
**Category**: Audio Analysis
**Subcategories**:
- Spectrum Analyzers
- Oscilloscopes
- Phase Analyzers
- Loudness Meters
- Frequency Analyzers
- Waveform Viewers

### 10. `midi_tools.json` (To Create)
**Category**: MIDI Tools
**Subcategories**:
- MIDI Sequencers
- MIDI Editors
- MIDI Utilities
- MIDI Controllers
- MIDI Converters

### 11. `video_audio.json` (To Create)
**Category**: Video Audio
**Subcategories**:
- Video Editing with Audio
- Audio for Video Post
- Sync Tools
- Dialogue Tools

### 12. `utilities.json` (To Create)
**Category**: Audio Utilities
**Subcategories**:
- File Converters
- Batch Processors
- Metadata Tools
- Backup Tools
- System Utilities

## Naming Convention

- Use full software names: "Avid Pro Tools" not just "Pro Tools"
- Include developer/publisher: "Native Instruments Kontakt" not just "Kontakt"
- Be consistent with capitalization
- Use proper spacing and punctuation

## Example Entry

```json
{
  "Virtual Instruments": {
    "Synthesizers": [
      "Native Instruments Massive",
      "Native Instruments Serum",
      "Arturia V Collection",
      "Xfer Records Serum",
      "u-he Diva",
      "u-he Zebra"
    ],
    "Samplers": [
      "Native Instruments Kontakt",
      "Steinberg HALion",
      "Image-Line DirectWave",
      "TAL Software TAL-Sampler"
    ]
  }
}
```

## Import Process

Once you've created the JSON files:

1. Place them in `data/software/` directory
2. Run the SQL migration: `sql/software_database_import.sql`
3. Run the import script: `node scripts/import-software-database.js`

The script will automatically detect and import all JSON files in the `data/software/` directory.

