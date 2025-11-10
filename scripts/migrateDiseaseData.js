// scripts/migrateDiseaseData.js
// Run this once: node scripts/migrateDiseaseData.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first

async function migrate() {
  try {
    // Check multiple possible env variable names
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.MONGODB_URL || 
                     process.env.MONGO_URI ||
                     process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables!');
      console.error('Please check your .env or .env.local file for:');
      console.error('  - MONGODB_URI');
      console.error('  - MONGODB_URL');
      console.error('  - MONGO_URI');
      console.error('  - DATABASE_URL');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('diseasediagnoses'); // FIXED: correct collection name

    // Update all records that don't have severity_score but have primary_disease.affected_percentage
    const result1 = await collection.updateMany(
      {
        severity_score: { $exists: false },
        'primary_disease.affected_percentage': { $exists: true, $ne: null }
      },
      [{
        $set: {
          severity_score: '$primary_disease.affected_percentage'
        }
      }]
    );

    console.log(`✓ Migrated severity_score from affected_percentage: ${result1.modifiedCount} records`);

    // For records without either field, set severity_score based on probability
    const result2 = await collection.updateMany(
      {
        severity_score: { $exists: false },
        is_healthy: false,
        'primary_disease.probability': { $exists: true }
      },
      [{
        $set: {
          severity_score: {
            $multiply: ['$primary_disease.probability', 100]
          }
        }
      }]
    );

    console.log(`✓ Calculated severity_score from probability: ${result2.modifiedCount} records`);

    // Set default severity_score = 0 for healthy plants
    const result3 = await collection.updateMany(
      {
        severity_score: { $exists: false },
        is_healthy: true
      },
      {
        $set: { severity_score: 0 }
      }
    );

    console.log(`✓ Set severity_score = 0 for healthy plants: ${result3.modifiedCount} records`);

    // Add default values for missing fields
    const result4 = await collection.updateMany(
      {
        $or: [
          { category_id: { $exists: false } },
          { category_name: { $exists: false } },
          { saved_to_category: { $exists: false } }
        ]
      },
      {
        $set: {
          category_id: null,
          category_name: null,
          saved_to_category: false
        }
      }
    );

    console.log(`✓ Added default category fields: ${result4.modifiedCount} records`);

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();