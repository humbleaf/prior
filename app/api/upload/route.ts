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
const PINATA_API_KEY = process.env.PINATA_API_KEY; // Alternative: API Key
const PINATA_API_SECRET = process.env.PINATA_API_SECRET; // Alternative: API Secret

// Pinata v2 API endpoint (current as of 2025)
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

    // Debug: Log what's actually loaded (keys masked)
    console.log('Pinata creds check:', {
      hasJWT: !!PINATA_JWT,
      jwtPrefix: PINATA_JWT ? PINATA_JWT.substring(0, 20) + '...' : 'none',
      hasApiKey: !!PINATA_API_KEY,
      keyPrefix: PINATA_API_KEY ? PINATA_API_KEY.substring(0, 10) + '...' : 'none',
      hasSecret: !!PINATA_API_SECRET,
    });

    // Validate Pinata credentials exist
    if (!PINATA_JWT && !(PINATA_API_KEY && PINATA_API_SECRET)) {
      console.error('Pinata credentials not configured (need PINATA_JWT or PINATA_API_KEY + PINATA_API_SECRET)');
      return NextResponse.json(
        { error: 'Server configuration error: Pinata credentials missing' },
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

    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes (${(file.size/1024/1024).toFixed(2)}MB)`);

    // Forward to Pinata v1 API (still supported, but use API Key auth for reliability)
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

    // Prioritize API Key auth (more reliable) over JWT
    const headers: Record<string, string> = {};
    let authMethod = 'none';
    if (PINATA_API_KEY && PINATA_API_SECRET) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_API_SECRET;
      authMethod = 'api_key';
      console.log('Using Pinata API Key auth');
    } else if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
      authMethod = 'jwt';
      console.log('Using Pinata JWT auth (WARNING: may lack scopes)');
    } else {
      console.log('NO AUTH METHOD AVAILABLE');
    }

    const response = await fetch(PINATA_URL, {
      method: 'POST',
      headers,
      body: pinataForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error:', response.status, errorText);
      
      // Parse specific Pinata errors
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.reason === 'NO_SCOPES_FOUND') {
          errorMessage = 'Pinata key lacks upload permission. Use PINATA_API_KEY + PINATA_API_SECRET instead of JWT at pinata.cloud/keys';
        } else if (errorJson.error?.details) {
          errorMessage = errorJson.error.details;
        }
      } catch {}
      
      return NextResponse.json(
        { error: `Pinata upload failed: ${errorMessage}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('Pinata success:', data.IpfsHash || data.Hash || data.PinHash);
    
    // Handle both v1 and v2 response formats
    const cid = data.IpfsHash || data.Hash || data.PinHash || data.cid;
    const size = data.PinSize || data.size || data.Size || file.size;
    const timestamp = data.Timestamp || Date.now();
    
    if (!cid) {
      console.error('Unexpected Pinata response:', data);
      return NextResponse.json(
        { error: 'Invalid response from Pinata - no CID found' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      cid: cid,
      size: size,
      timestamp: timestamp,
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
