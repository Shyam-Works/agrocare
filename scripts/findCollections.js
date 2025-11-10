// scripts/findCollections.js
// Run: node scripts/findCollections.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function findCollections() {
  try {
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.MONGODB_URL || 
                     process.env.MONGO_URI ||
                     process.env.DATABASE_URL;
    
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    
    console.log('=== ALL COLLECTIONS IN DATABASE ===\n');
    
    if (collections.length === 0) {
      console.log('⚠️  No collections found in database');
      process.exit(0);
    }

    for (const collection of collections) {
      const collName = collection.name;
      const count = await db.collection(collName).countDocuments();
      console.log(`📁 ${collName}: ${count} documents`);
      
      // If collection has diagnosis-related name, show sample
      if (collName.toLowerCase().includes('diagnos') || 
          collName.toLowerCase().includes('disease') ||
          collName.toLowerCase().includes('plant')) {
        
        const sample = await db.collection(collName).findOne({});
        if (sample) {
          console.log(`   Sample fields: ${Object.keys(sample).slice(0, 10).join(', ')}...`);
        }
      }
    }

    console.log('\n=== SEARCHING FOR DIAGNOSIS DATA ===\n');

    // Check possible collection names
    const possibleNames = [
      'disease_diagnoses',
      'diseasediagnoses',
      'DiseaseDiagnosis',
      'diagnoses',
      'disease_diagnosis'
    ];

    for (const name of possibleNames) {
      try {
        const count = await db.collection(name).countDocuments();
        if (count > 0) {
          console.log(`✓ Found ${count} records in: ${name}`);
          
          const sample = await db.collection(name).findOne({});
          console.log('\n📋 Sample record from', name, ':');
          console.log(JSON.stringify(sample, null, 2));
          break;
        }
      } catch (err) {
        // Collection doesn't exist, continue
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Search completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Search failed:', error);
    process.exit(1);
  }
}

findCollections();