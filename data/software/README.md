# Software Database JSON Files

This directory contains JSON files for different software categories relevant to audio professionals.

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

## Category Files

Create separate JSON files for each category:

- `daws.json` - Digital Audio Workstations
- `plugins_effects.json` - Audio effects plugins (EQ, Compression, Reverb, etc.)
- `plugins_instruments.json` - Virtual instruments (Synths, Samplers, etc.)
- `plugins_mastering.json` - Mastering tools and plugins
- `plugins_restoration.json` - Audio restoration and repair tools
- `sample_libraries.json` - Sample libraries and packs
- `notation.json` - Music notation software
- `live_performance.json` - Live performance and DJ software
- `audio_analysis.json` - Audio analysis and metering tools
- `midi_tools.json` - MIDI tools and utilities
- `video_audio.json` - Video editing with audio features
- `utilities.json` - Audio utilities and helper tools

## Naming Convention

- Use full software names: "Avid Pro Tools" not just "Pro Tools"
- Include developer/publisher: "Native Instruments Kontakt" not just "Kontakt"
- Be consistent with capitalization
- Use proper spacing and punctuation

## Example Entry

```json
{
  "DAWs": {
    "Desktop DAWs": [
      "Avid Pro Tools",
      "Apple Logic Pro",
      "Steinberg Cubase"
    ]
  }
}
```

