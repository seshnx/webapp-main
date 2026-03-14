// Quick test to verify settings save/load flow
console.log("=== Testing Settings Flow ===");

// 1. Check if functions exist
console.log("\n1. Checking imports...");
const fs = require('fs');
const mongoSocial = fs.readFileSync('src/config/mongoSocial.ts', 'utf8');

if (mongoSocial.includes('export async function getProfile')) {
  console.log("✅ getProfile function exists");
} else {
  console.log("❌ getProfile function MISSING");
}

if (mongoSocial.includes('export async function upsertProfile')) {
  console.log("✅ upsertProfile function exists");
} else {
  console.log("❌ upsertProfile function MISSING");
}

if (mongoSocial.includes('getMongoDb()')) {
  console.log("✅ Using correct getMongoDb()");
} else {
  console.log("❌ Not using getMongoDb()");
}

// 2. Check unified service imports
console.log("\n2. Checking unified service...");
const unifiedService = fs.readFileSync('src/services/unifiedUserData.ts', 'utf8');

if (unifiedService.includes('getProfile as getMongoProfile')) {
  console.log("✅ getMongoProfile imported");
} else {
  console.log("❌ getMongoProfile NOT imported");
}

if (unifiedService.includes('upsertProfile as upsertMongoProfile')) {
  console.log("✅ upsertMongoProfile imported");
} else {
  console.log("❌ upsertMongoProfile NOT imported");
}

if (unifiedService.includes('mongoUpdates.settings = updates.settings')) {
  console.log("✅ Settings routed to MongoDB");
} else {
  console.log("❌ Settings NOT routed to MongoDB");
}

console.log("\n=== Test Complete ===");
