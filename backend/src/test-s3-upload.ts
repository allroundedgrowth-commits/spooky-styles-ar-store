import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { awsConfig } from './config/aws.js';
// import fs from 'fs';
// import path from 'path';

async function testS3Upload() {
  console.log('🎃 Testing S3 Upload\n');
  
  console.log('📋 Configuration:');
  console.log(`  Region: ${awsConfig.region}`);
  console.log(`  Bucket: ${awsConfig.s3.bucketName}`);
  console.log(`  Access Key: ${awsConfig.credentials.accessKeyId.substring(0, 8)}...`);
  console.log('');

  const s3Client = new S3Client({
    region: awsConfig.region,
    credentials: awsConfig.credentials,
  });

  try {
    // Test 1: List buckets
    console.log('1️⃣ Testing AWS credentials by listing buckets...');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);
    console.log(`✅ Found ${listResponse.Buckets?.length || 0} buckets`);
    
    const targetBucket = listResponse.Buckets?.find(b => b.Name === awsConfig.s3.bucketName);
    if (targetBucket) {
      console.log(`✅ Target bucket "${awsConfig.s3.bucketName}" exists`);
    } else {
      console.log(`⚠️  Bucket "${awsConfig.s3.bucketName}" not found in list`);
    }
    console.log('');

    // Test 2: Upload a test file
    console.log('2️⃣ Uploading test file...');
    const testContent = 'Hello from Spooky Wigs! 🎃';
    const testKey = `test/upload-test-${Date.now()}.txt`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: awsConfig.s3.bucketName,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read',
    });

    await s3Client.send(uploadCommand);
    console.log(`✅ File uploaded successfully!`);
    console.log(`   Key: ${testKey}`);
    
    const publicUrl = `https://${awsConfig.s3.bucketName}.s3.${awsConfig.region}.amazonaws.com/${testKey}`;
    console.log(`   Public URL: ${publicUrl}`);
    console.log('');

    // Test 3: Verify URL is accessible
    console.log('3️⃣ Testing if file is publicly accessible...');
    const response = await fetch(publicUrl);
    if (response.ok) {
      const content = await response.text();
      console.log(`✅ File is publicly accessible!`);
      console.log(`   Content: ${content}`);
    } else {
      console.log(`❌ File not accessible (Status: ${response.status})`);
      console.log(`   This might mean bucket permissions need adjustment`);
    }
    console.log('');

    console.log('✅ S3 Upload Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Verify bucket permissions allow public read');
    console.log('2. Check CORS configuration');
    console.log('3. Try uploading via admin dashboard');

  } catch (error: any) {
    console.error('❌ S3 Test Failed:', error.message);
    
    if (error.Code === 'InvalidAccessKeyId') {
      console.error('\n🔑 Invalid Access Key - Check your AWS credentials');
    } else if (error.Code === 'SignatureDoesNotMatch') {
      console.error('\n🔑 Invalid Secret Key - Check your AWS secret access key');
    } else if (error.Code === 'NoSuchBucket') {
      console.error('\n🪣 Bucket not found - Verify bucket name and region');
    } else if (error.Code === 'AccessDenied') {
      console.error('\n🚫 Access Denied - Check IAM permissions');
    }
    
    console.error('\nFull error:', error);
  }
}

testS3Upload();
