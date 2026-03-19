-- =====================================================
-- FIX EQUIPMENT DATABASE CONSTRAINT
-- =====================================================
-- This script fixes the unique constraint to allow
-- same brand/model in different categories
-- =====================================================

-- Drop old constraint if it exists (brand, model only)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'equipment_database_brand_model_key'
               AND table_name = 'equipment_database') THEN
        ALTER TABLE equipment_database DROP CONSTRAINT equipment_database_brand_model_key;
        RAISE NOTICE 'Dropped old constraint: equipment_database_brand_model_key';
    END IF;
END $$;

-- Ensure the correct constraint exists (brand, model, category)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'equipment_database_brand_model_category_key'
                   AND table_name = 'equipment_database') THEN
        ALTER TABLE equipment_database 
        ADD CONSTRAINT equipment_database_brand_model_category_key 
        UNIQUE(brand, model, category);
        RAISE NOTICE 'Added constraint: equipment_database_brand_model_category_key';
    ELSE
        RAISE NOTICE 'Constraint already exists: equipment_database_brand_model_category_key';
    END IF;
END $$;

