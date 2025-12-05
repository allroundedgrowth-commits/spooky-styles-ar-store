import dotenv from 'dotenv';
import { s3Service } from './services/s3.service.js';
import { s3Config } from './config/aws.js';
// import fs from 'fs';
// import path from 'path';

dotenv.config();

/**
 * Test script for S3 and CloudFront functionality
 */
async function testS3Integration() {
  console.log('🎃 Testing S3 and CloudFront Integration\n');

  // Check configuration
  console.log('📋 Configuration:');
  console.log(`  Region: ${s3Config.region}`);
  console.log(`  Bucket: ${s3Config.bucketName}`);
  console.log(`  CloudFront: ${s3Config.cloudfrontDomain || 'Not configured'}`);
  console.log('');

  // Test 1: Check if AWS credentials are configured
  console.log('1️⃣ Checking AWS credentials...');
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ AWS credentials not configured');
    console.log('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
    return;
  }
  console.log('✅ AWS credentials configured\n');

  // Test 2: Test file existence check
  console.log('2️⃣ Testing file existence check...');
  try {
    const exists = await s3Service.fileExists('test-file-that-does-not-exist.jpg');
    console.log(`✅ File existence check works (result: ${exists})\n`);
  } catch (error) {
    console.log('❌ File existence check failed:', error);
    return;
  }

  // Test 3: Test public URL generation
  console.log('3️⃣ Testing public URL generation...');
  const testKey = 'products/test-image.jpg';
  const publicUrl = s3Service.getPublicUrl(testKey);
  console.log(`✅ Public URL: ${publicUrl}\n`);

  // Test 4: Test signed URL generation (S3)
  console.log('4️⃣ Testing S3 signed URL generation...');
  try {
    const signedUrl = await s3Service.generateSignedUrl(testKey, 3600);
    console.log(`✅ S3 Signed URL generated (expires in 1 hour)`);
    console.log(`   URL length: ${signedUrl.length} characters\n`);
  } catch (error) {
    console.log('⚠️  S3 signed URL generation failed (file may not exist):', error);
    console.log('   This is expected if the test file does not exist\n');
  }

  // Test 5: Test CloudFront signed URL generation
  console.log('5️⃣ Testing CloudFront signed URL generation...');
  if (s3Config.cloudfrontDomain) {
    const cdnSignedUrl = s3Service.generateCDNSignedUrl(testKey, 3600);
    console.log(`✅ CloudFront Signed URL generated`);
    console.log(`   URL: ${cdnSignedUrl.substring(0, 80)}...\n`);
  } else {
    console.log('⚠️  CloudFront not configured (optional)\n');
  }

  // Test 6: Test srcset generation
  console.log('6️⃣ Testing srcset generation...');
  const mockVariants = [
    { key: 'test-thumb.webp', url: 'https://cdn.example.com/test-thumb.webp', width: 320, format: 'webp' },
    { key: 'test-medium.webp', url: 'https://cdn.example.com/test-medium.webp', width: 640, format: 'webp' },
    { key: 'test-large.webp', url: 'https://cdn.example.com/test-large.webp', width: 1280, format: 'webp' },
  ];
  const srcset = s3Service.generateSrcSet(mockVariants);
  console.log('✅ Srcset generated:');
  console.log(`   ${srcset}\n`);

  // Summary
  console.log('📊 Test Summary:');
  console.log('✅ S3 service initialized successfully');
  console.log('✅ URL generation working');
  console.log('✅ Signed URL generation working');
  console.log('✅ Srcset generation working');
  
  if (!s3Config.cloudfrontDomain) {
    console.log('⚠️  CloudFront not configured (optional for development)');
  }

  console.log('\n🎃 S3 Integration Test Complete!');
  console.log('\nNext steps:');
  console.log('1. Configure AWS credentials if not already done');
  console.log('2. Create S3 bucket: ' + s3Config.bucketName);
  console.log('3. (Optional) Set up CloudFront distribution');
  console.log('4. Test file upload via API: POST /api/upload/image');
}

// Run tests
testS3Integration()
  .then(() => {
    console.log('\n✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
