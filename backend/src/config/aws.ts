import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl as cloudfrontGetSignedUrl } from '@aws-sdk/cloudfront-signer';

// Initialize S3 Client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 Configuration
export const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'spooky-styles-assets',
  region: process.env.AWS_REGION || 'us-east-1',
  cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN || '',
  cloudfrontKeyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
  cloudfrontPrivateKey: process.env.CLOUDFRONT_PRIVATE_KEY || '',
};

// CloudFront signed URL configuration
export const cloudfrontConfig = {
  domain: s3Config.cloudfrontDomain,
  keyPairId: s3Config.cloudfrontKeyPairId,
  privateKey: s3Config.cloudfrontPrivateKey,
  // URLs expire after 1 hour by default
  defaultExpiration: 3600,
};

/**
 * Generate a CloudFront signed URL for secure asset access
 */
export const generateCloudFrontSignedUrl = (
  objectKey: string,
  expirationSeconds: number = cloudfrontConfig.defaultExpiration
): string => {
  // If CloudFront is not configured, return direct S3 URL
  if (!cloudfrontConfig.domain || !cloudfrontConfig.keyPairId || !cloudfrontConfig.privateKey) {
    return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${objectKey}`;
  }

  const url = `https://${cloudfrontConfig.domain}/${objectKey}`;
  const dateLessThan = new Date(Date.now() + expirationSeconds * 1000).toISOString();

  try {
    return cloudfrontGetSignedUrl({
      url,
      keyPairId: cloudfrontConfig.keyPairId,
      privateKey: cloudfrontConfig.privateKey,
      dateLessThan,
    });
  } catch (error) {
    console.error('Error generating CloudFront signed URL:', error);
    // Fallback to direct URL
    return url;
  }
};
