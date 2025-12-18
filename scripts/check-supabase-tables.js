/**
 * Supabase Database Diagnostic Script
 * 
 * This script checks if your Supabase tables exist and are accessible.
 * Run with: node scripts/check-supabase-tables.js
 * 
 * Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in your .env file
 * or pass them as environment variables.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('   Or create a .env file with these variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to check (from your SQL files)
const tablesToCheck = [
  'market_items',
  'marketplace_items',
  'gear_listings',
  'gear_orders',
  'gear_offers',
  'safe_exchange_transactions',
  'user_library'
];

async function checkTable(tableName) {
  try {
    // Try to query the table
    const { data, error, status } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return { exists: false, accessible: false, error: 'Table does not exist' };
      }
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return { exists: true, accessible: false, error: 'Permission denied (RLS policy blocking)' };
      }
      return { exists: 'unknown', accessible: false, error: error.message };
    }

    return { 
      exists: true, 
      accessible: true, 
      rowCount: data?.length || 0,
      status 
    };
  } catch (err) {
    return { 
      exists: 'unknown', 
      accessible: false, 
      error: err.message 
    };
  }
}

async function main() {
  console.log('🔍 Checking Supabase Database...\n');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...\n`);

  const results = [];

  for (const table of tablesToCheck) {
    process.stdout.write(`Checking ${table}... `);
    const result = await checkTable(table);
    results.push({ table, ...result });

    if (result.exists && result.accessible) {
      console.log(`✅ Exists and accessible (${result.rowCount} rows)`);
    } else if (result.exists === false) {
      console.log(`❌ Does not exist`);
    } else if (result.exists && !result.accessible) {
      console.log(`⚠️  Exists but not accessible: ${result.error}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  }

  console.log('\n📊 Summary:\n');
  const existing = results.filter(r => r.exists === true);
  const missing = results.filter(r => r.exists === false);
  const inaccessible = results.filter(r => r.exists === true && !r.accessible);

  console.log(`✅ Accessible tables: ${existing.filter(r => r.accessible).length}`);
  console.log(`❌ Missing tables: ${missing.length}`);
  console.log(`⚠️  Inaccessible tables: ${inaccessible.length}`);

  if (missing.length > 0) {
    console.log('\n💡 Missing tables that need to be created:');
    missing.forEach(r => console.log(`   - ${r.table}`));
    console.log('\n   Run the SQL scripts in the sql/ folder in your Supabase SQL Editor');
  }

  if (inaccessible.length > 0) {
    console.log('\n⚠️  Tables exist but are not accessible:');
    inaccessible.forEach(r => console.log(`   - ${r.table}: ${r.error}`));
    console.log('\n   Check your Row Level Security (RLS) policies in Supabase');
  }

  // Test the specific query that's failing
  console.log('\n🔍 Testing the failing query (market_items with limit 1)...');
  const { data, error } = await supabase
    .from('market_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log(`❌ Query failed: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Details: ${error.details || 'N/A'}`);
  } else if (data) {
    console.log(`✅ Query successful! Found item: ${data.title || data.id}`);
  } else {
    console.log(`✅ Query successful but no items found (table is empty)`);
  }
}

main().catch(console.error);

