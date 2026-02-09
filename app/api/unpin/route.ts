import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side IPFS unpin (admin only)
 * Keeps Pinata JWT server-side
 */

const PINATA_JWT = process.env.PINATA_JWT; // Server-side only

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid');
    
    if (!cid) {
      return NextResponse.json(
        { error: 'CID required' },
        { status: 400 }
      );
    }

    if (!PINATA_JWT) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const cleanCid = cid.replace('ipfs://', '');
    
    const response = await fetch(
      `https://api.pinata.cloud/pinning/unpin/${cleanCid}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Unpin failed: ${error}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true, cid: cleanCid });
    
  } catch (error) {
    console.error('Unpin error:', error);
    return NextResponse.json(
      { error: 'Unpin failed' },
      { status: 500 }
    );
  }
}
