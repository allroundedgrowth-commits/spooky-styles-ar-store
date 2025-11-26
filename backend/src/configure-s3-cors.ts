import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.S3_BUCKET_NAME || 'amz-s3-hackathon-wigs';

async function configureS3CORS() {
  console.log('🔧 Configuring S3 CORS for bucket:', bucketName);

  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: ['*'], // In production, specify your domain
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ],
  };

  try {
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);
    console.log('✅ CORS configuration applied successfully!');
    console.log('\nCORS Rules:');
    console.log('  - Allowed Origins: * (all)');
    console.log('  - Allowed Methods: GET, PUT, POST, DELETE, HEAD');
    console.log('  - Allowed Headers: *');
    console.log('\n🎃 Images should now load in the browser!');
  } catch (error: any) {
    console.error('❌ Failed to configure CORS:', error.message);
    if (error.Code === 'NoSuchBucket') {
      console.error('\n⚠️  Bucket does not exist. Please create it first.');
    }
    process.exit(1);
  }
}

configureS3CORS();
