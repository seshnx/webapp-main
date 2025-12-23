-- =====================================================
-- FIX INCORRECT BRAND PARSING - SQL Script
-- =====================================================
-- This script helps identify entries with incorrect brand parsing
-- Run the Node.js script (scripts/fix-incorrect-brands.js) to automatically fix them
-- =====================================================

-- Find entries where model starts with "&" (likely split multi-word brand)
SELECT 
    id,
    brand,
    model,
    category,
    CONCAT(brand, ' ', model) as full_name,
    CASE 
        WHEN model LIKE '&%' THEN 'Likely incorrect - model starts with &'
        WHEN model LIKE '-%' THEN 'Likely incorrect - model starts with -'
        WHEN brand LIKE '%&%' AND model LIKE '%&%' THEN 'Likely incorrect - both contain &'
        ELSE 'Review needed'
    END as issue
FROM equipment_database
WHERE 
    model LIKE '&%' 
    OR model LIKE '-%'
    OR (brand LIKE '%&%' AND model LIKE '%&%')
ORDER BY brand, model
LIMIT 100;

-- Count of potentially incorrect entries
SELECT COUNT(*) as potentially_incorrect_count
FROM equipment_database
WHERE 
    model LIKE '&%' 
    OR model LIKE '-%'
    OR (brand LIKE '%&%' AND model LIKE '%&%');

-- Example: Manual fix for "Allen & Heath" entries
-- UPDATE equipment_database
-- SET 
--     brand = 'Allen & Heath',
--     model = REPLACE(model, '& Heath ', ''),
--     name = REPLACE(model, '& Heath ', '')
-- WHERE brand = 'Allen' AND model LIKE '& Heath%';

-- Note: It's recommended to use the Node.js script (scripts/fix-incorrect-brands.js)
-- which uses the improved parseEquipmentName function to correctly fix all entries

