/**
 * Browser Console Script - Check Supabase Tables
 * 
 * Copy and paste this entire script into your browser console while on your app.
 * It will check if your Supabase tables exist and are accessible.
 */

(async function checkSupabaseTables() {
  // Get Supabase client from your app
  const supabase = window.supabase || (await import('../src/config/supabase.js')).supabase;
  
  if (!supabase) {
    console.error('❌ Supabase client not found. Make sure you are on a page that loads Supabase.');
    return;
  }

  console.log('🔍 Checking Supabase Database Tables...\n');

  const tablesToCheck = [
    'market_items',
    'marketplace_items',
    'gear_listings',
    'gear_orders',
    'gear_offers',
    'safe_exchange_transactions',
    'user_library'
  ];

  const results = [];

  for (const table of tablesToCheck) {
    try {
      const { data, error, status } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          results.push({ table, exists: false, error: 'Table does not exist' });
          console.log(`❌ ${table}: Does not exist`);
        } else if (error.code === '42501' || error.message?.includes('permission denied')) {
          results.push({ table, exists: true, accessible: false, error: 'Permission denied (RLS)' });
          console.log(`⚠️  ${table}: Exists but not accessible (RLS policy blocking)`);
        } else {
          results.push({ table, exists: 'unknown', error: error.message });
          console.log(`❌ ${table}: Error - ${error.message}`);
        }
      } else {
        results.push({ table, exists: true, accessible: true, rowCount: data?.length || 0 });
        console.log(`✅ ${table}: Exists and accessible (${data?.length || 0} rows)`);
      }
    } catch (err) {
      results.push({ table, exists: 'unknown', error: err.message });
      console.log(`❌ ${table}: Exception - ${err.message}`);
    }
  }

  // Test the specific failing query
  console.log('\n🔍 Testing the failing query (market_items with limit 1)...');
  try {
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
      console.log(`   Hint: ${error.hint || 'N/A'}`);
    } else if (data) {
      console.log(`✅ Query successful! Found item:`, data);
    } else {
      console.log(`✅ Query successful but no items found (table is empty)`);
    }
  } catch (err) {
    console.log(`❌ Query exception: ${err.message}`);
  }

  // Summary
  console.log('\n📊 Summary:');
  const existing = results.filter(r => r.exists === true && r.accessible);
  const missing = results.filter(r => r.exists === false);
  const inaccessible = results.filter(r => r.exists === true && !r.accessible);

  console.log(`✅ Accessible: ${existing.length}`);
  console.log(`❌ Missing: ${missing.length}`);
  console.log(`⚠️  Inaccessible: ${inaccessible.length}`);

  if (missing.length > 0) {
    console.log('\n💡 Missing tables:');
    missing.forEach(r => console.log(`   - ${r.table}`));
    console.log('\n   → Run the SQL scripts in sql/ folder in your Supabase SQL Editor');
  }

  return results;
})();

