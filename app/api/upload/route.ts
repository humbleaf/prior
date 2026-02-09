import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds max

// NOTE: Body size limit is controlled by Vercel platform:
// - Free tier: 4.5MB max (hard limit, not configurable)
// - Pro tier: up to 100MB (contact support to raise)
// App Router doesn't support the old `config.api.bodyParser` export format

/**
 * Server-side IPFS upload proxy
 * Keeps Pinata JWT server-side, prevents abuse
 */

const PINATA_JWT = process.env.PINATA_JWT; // Server-side only
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

// Simple rate limiter (in-memory, resets on deploy)
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT = 5; // uploads per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  
  // Clean old requests
  const validRequests = requests.filter(time => now - time < RATE_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT) {
    return true;
  }
  
  validRequests.push(now);
  rateLimiter.set(ip, validRequests);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 5 uploads per hour.' },
        { status: 429 }
      );
    }

    // Validate JWT exists server-side
    if (!PINATA_JWT) {
      console.error('PINATA_JWT not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error('Form data parse error:', err);
      return NextResponse.json(
        { error: 'Invalid form data. Check file size (max ~4.5MB on Vercel free tier).' },
        { status: 400 }
      );
    }
    
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Size check (100MB max for Pinata, but Vercel has limits)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 100MB.' },
        { status: 413 }
      );
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);

    // Forward to Pinata
    const pinataForm = new FormData();
    pinataForm.append('file', file, file.name);
    
    // Add metadata
    pinataForm.append('pinataMetadata', JSON.stringify({
      name: file.name,
      keyvalues: {
        origin: 'prior-app',
        timestamp: new Date().toISOString(),
      }
    }));

    const response = await fetch(PINATA_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: pinataForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error:', response.status, errorText);
      return NextResponse.json(
        { error: `Pinata upload failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('Pinata success:', data.IpfsHash);
    
    return NextResponse.json({
      success: true,
      cid: data.IpfsHash,
      size: data.PinSize,
      timestamp: data.Timestamp,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Upload API ready' });
}
