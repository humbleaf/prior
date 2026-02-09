// lib/ipfs.ts - Pinata IPFS integration

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';

export interface IPFSUploadResult {
  cid: string;
  ipfsUrl: string;
  gatewayUrl: string;
  size: number;
}

/**
 * Test if IPFS is configured
 */
export function isIPFSConfigured(): boolean {
  const hasJwt = !!PINATA_JWT;
  console.log('IPFS Config check - JWT available:', hasJwt);
  console.log('JWT length:', PINATA_JWT?.length);
  return hasJwt;
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadToIPFS(
  file: Blob | File,
  filename?: string
): Promise<IPFSUploadResult> {
  
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured. Check NEXT_PUBLIC_PINATA_JWT env var.');
  }
  
  const formData = new FormData();
  formData.append('file', file, filename || 'prior-upload');
  
  // Metadata
  const metadata = JSON.stringify({
    name: filename || 'prior-claim',
    keyvalues: {
      source: 'prior-app',
      timestamp: Date.now().toString(),
    }
  });
  formData.append('pinataMetadata', metadata);
  
  // Options
  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);
  
  try {
    console.log('Uploading to Pinata...');
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error response:', errorText);
      throw new Error(`Pinata upload failed: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Pinata upload success:', data.IpfsHash);
    
    return {
      cid: data.IpfsHash,
      ipfsUrl: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      size: data.PinSize,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadJSONToIPFS(
  jsonData: object,
  filename?: string
): Promise<IPFSUploadResult> {
  const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
  return uploadToIPFS(blob, filename || 'metadata.json');
}

/**
 * Fetch content from IPFS via gateway
 */
export async function fetchFromIPFS(cid: string): Promise<Response> {
  const cleanCid = cid.replace('ipfs://', '');
  
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cleanCid}`,
    `https://ipfs.io/ipfs/${cleanCid}`,
    `https://cloudflare-ipfs.com/ipfs/${cleanCid}`,
  ];
  
  for (const gateway of gateways) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(gateway, { 
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Gateway failed: ${gateway}`, error);
      continue;
    }
  }
  
  throw new Error(`Failed to fetch from all IPFS gateways for CID: ${cid}`);
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getIPFSGatewayUrl(
  cid: string, 
  preferredGateway: 'pinata' | 'ipfs.io' | 'cloudflare' = 'pinata'
): string {
  const cleanCid = cid.replace('ipfs://', '');
  
  const gateways = {
    pinata: `https://gateway.pinata.cloud/ipfs/${cleanCid}`,
    'ipfs.io': `https://ipfs.io/ipfs/${cleanCid}`,
    cloudflare: `https://cloudflare-ipfs.com/ipfs/${cleanCid}`,
  };
  
  return gateways[preferredGateway];
}

/**
 * Unpin content from Pinata
 */
export async function unpinFromIPFS(cid: string): Promise<void> {
  if (!PINATA_JWT) {
    console.warn('No Pinata JWT configured, cannot unpin');
    return;
  }
  
  try {
    const cleanCid = cid.replace('ipfs://', '');
    
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cleanCid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to unpin ${cid}:`, await response.text());
    }
  } catch (error) {
    console.error('Unpin error:', error);
  }
}
