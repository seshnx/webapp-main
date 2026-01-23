-- =====================================================
-- FIX INCORRECT BRAND PARSING - Software Database SQL Script
-- =====================================================
-- This script helps identify entries with incorrect brand parsing
-- Run the Node.js script (scripts/fix-incorrect-software-brands.js) to automatically fix them
-- =====================================================

-- Find entries where model starts with "&" (likely split multi-word developer)
SELECT 
    id,
    brand,
    model,
    category,
    subcategory,
    CONCAT(brand, ' ', model) as full_name,
    CASE 
        WHEN model LIKE '&%' THEN 'Likely incorrect - model starts with &'
        WHEN model LIKE '-%' THEN 'Likely incorrect - model starts with -'
        WHEN brand LIKE '%&%' AND model LIKE '%&%' THEN 'Likely incorrect - both contain &'
        WHEN model ILIKE 'Instruments %' THEN 'Likely incorrect - model starts with "Instruments"'
        WHEN model ILIKE 'Audio %' THEN 'Likely incorrect - model starts with "Audio"'
        WHEN model ILIKE 'Studio %' THEN 'Likely incorrect - model starts with "Studio"'
        WHEN model ILIKE 'Multimedia %' THEN 'Likely incorrect - model starts with "Multimedia"'
        WHEN model ILIKE 'Records %' THEN 'Likely incorrect - model starts with "Records"'
        WHEN model ILIKE 'Labs %' THEN 'Likely incorrect - model starts with "Labs"'
        WHEN model ILIKE 'DSP %' THEN 'Likely incorrect - model starts with "DSP"'
        ELSE 'Review needed'
    END as issue
FROM software_database
WHERE 
    model LIKE '&%' 
    OR model LIKE '-%'
    OR (brand LIKE '%&%' AND model LIKE '%&%')
    OR model ILIKE 'Instruments %'
    OR model ILIKE 'Audio %'
    OR model ILIKE 'Studio %'
    OR model ILIKE 'Multimedia %'
    OR model ILIKE 'Records %'
    OR model ILIKE 'Labs %'
    OR model ILIKE 'DSP %'
ORDER BY brand, model
LIMIT 100;

-- Count of potentially incorrect entries
SELECT COUNT(*) as potentially_incorrect_count
FROM software_database
WHERE 
    model LIKE '&%' 
    OR model LIKE '-%'
    OR (brand LIKE '%&%' AND model LIKE '%&%')
    OR model ILIKE 'Instruments %'
    OR model ILIKE 'Audio %'
    OR model ILIKE 'Studio %'
    OR model ILIKE 'Multimedia %'
    OR model ILIKE 'Records %'
    OR model ILIKE 'Labs %'
    OR model ILIKE 'DSP %';

-- Examples of common incorrect patterns:
-- "Native Instruments" → brand: "Native", model: "Instruments Kontakt" ❌
-- "Native Instruments" → brand: "Native Instruments", model: "Kontakt" ✅
--
-- "Universal Audio" → brand: "Universal", model: "Audio Pultec EQP-1A" ❌
-- "Universal Audio" → brand: "Universal Audio", model: "Pultec EQP-1A" ✅
--
-- "Xfer Records" → brand: "Xfer", model: "Records Serum" ❌
-- "Xfer Records" → brand: "Xfer Records", model: "Serum" ✅

-- Note: It's recommended to use the Node.js script (scripts/fix-incorrect-software-brands.js)
-- which uses the improved parseSoftwareName function to correctly fix all entries

