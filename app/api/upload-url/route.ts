import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// 許可するファイル形式を定義
const allowedFileTypes = {
  'audio/mpeg': ['mp3'],
  'audio/wav': ['wav'],
  'audio/x-m4a': ['m4a'],
  'audio/mp4': ['m4a', 'mp4'],
};
type AllowedContentType = keyof typeof allowedFileTypes;

export async function POST(request: Request) {
  try {
    const {
      CLOUDFLARE_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME,
    } = process.env;

    if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      throw new Error('Cloudflare R2 credentials are not set in environment variables');
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_CUSTOM_DOMAIN}`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and contentType are required' }, { status: 400 });
    }

    // ファイル形式の検証
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    const allowedExtensions = allowedFileTypes[contentType as AllowedContentType];
    if (!allowedExtensions || !fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const key = `${Date.now()}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      url: signedUrl,
      key: key,
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
