// scripts/checkDatabaseRecords.js
// Run: node scripts/checkDatabaseRecords.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkRecords() {
  try {
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.MONGODB_URL || 
                     process.env.MONGO_URI ||
                     process.env.DATABASE_URL;
    
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('disease_diagnoses');

    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`📊 Total diagnoses in database: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('⚠️  No records found in disease_diagnoses collection');
      process.exit(0);
    }

    // Check one sample record
    console.log('=== SAMPLE RECORD ===');
    const sampleRecord = await collection.findOne({});
    console.log('Fields present in sample record:');
    console.log('- user_id:', sampleRecord.user_id ? '✓' : '✗');
    console.log('- is_healthy:', sampleRecord.is_healthy);
    console.log('- severity_score:', sampleRecord.severity_score !== undefined ? sampleRecord.severity_score : '❌ MISSING');
    console.log('- primary_disease.affected_percentage:', sampleRecord.primary_disease?.affected_percentage !== undefined ? sampleRecord.primary_disease.affected_percentage : '❌ MISSING');
    console.log('- primary_disease.disease_name:', sampleRecord.primary_disease?.disease_name || '❌ MISSING');
    console.log('- category_id:', sampleRecord.category_id !== undefined ? (sampleRecord.category_id || 'null') : '❌ MISSING');
    console.log('- category_name:', sampleRecord.category_name !== undefined ? (sampleRecord.category_name || 'null') : '❌ MISSING');
    console.log('- saved_to_category:', sampleRecord.saved_to_category !== undefined ? sampleRecord.saved_to_category : '❌ MISSING');
    
    console.log('\n=== FULL SAMPLE RECORD (first one) ===');
    console.log(JSON.stringify(sampleRecord, null, 2));

    // Check records without severity_score
    const withoutSeverity = await collection.countDocuments({
      severity_score: { $exists: false }
    });
    console.log(`\n📊 Records without severity_score: ${withoutSeverity}`);

    // Check records without category fields
    const withoutCategory = await collection.countDocuments({
      $or: [
        { category_id: { $exists: false } },
        { category_name: { $exists: false } },
        { saved_to_category: { $exists: false } }
      ]
    });
    console.log(`📊 Records without category fields: ${withoutCategory}`);

    // Check diseased plants
    const diseasedCount = await collection.countDocuments({ is_healthy: false });
    console.log(`📊 Diseased plants: ${diseasedCount}`);

    // Check healthy plants
    const healthyCount = await collection.countDocuments({ is_healthy: true });
    console.log(`📊 Healthy plants: ${healthyCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Check completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkRecords();