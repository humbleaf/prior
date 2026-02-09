// lib/ipfs.ts - Server-side IPFS upload proxy
// Keeps Pinata credentials server-side for security

export interface IPFSUploadResult {
  cid: string;
  ipfsUrl: string;
  gatewayUrl: string;
  size: number;
}

/**
 * Test if IPFS API is available
 */
export function isIPFSConfigured(): boolean {
  // Server-side API is always available if deployed
  return true;
}

/**
 * Upload file to IPFS via server-side API proxy
 * Keeps Pinata JWT server-side (not exposed to browser)
 */
export async function uploadToIPFS(
  file: Blob | File,
  filename?: string
): Promise<IPFSUploadResult> {
  
  const formData = new FormData();
  formData.append('file', file, filename || 'prior-upload');
  
  try {
    console.log('Uploading via API proxy...');
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      // Handle non-JSON errors (like Vercel's 413 HTML response)
      const contentType = response.headers.get('content-type');
      let errorMessage: string;
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || `Upload failed: ${response.status}`;
      } else {
        const errorText = await response.text();
        // Check for common Vercel errors
        if (response.status === 413 || errorText.includes('Entity Too Large')) {
          errorMessage = 'File too large for Vercel free tier (max 4.5MB). Upgrade to Pro for up to 100MB, or compress your file.';
        } else if (response.status === 504 || response.status === 502) {
          errorMessage = 'Upload timed out. Try a smaller file or check your connection.';
        } else {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        }
      }
      
      console.error('Upload error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Upload success:', data.cid);
    
    return {
      cid: data.cid,
      ipfsUrl: `ipfs://${data.cid}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.cid}`,
      size: data.size,
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
 * Unpin content from Pinata (admin only, server-side)
 */
export async function unpinFromIPFS(cid: string): Promise<void> {
  try {
    const cleanCid = cid.replace('ipfs://', '');
    
    const response = await fetch(`/api/unpin?cid=${cleanCid}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      console.warn(`Failed to unpin ${cid}:`, await response.text());
    }
  } catch (error) {
    console.error('Unpin error:', error);
  }
}

/**
 * Verify a CID exists on IPFS (for claim pre-check)
 */
export async function verifyCidExists(cid: string): Promise<boolean> {
  try {
    const cleanCid = cid.replace('ipfs://', '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://gateway.pinata.cloud/ipfs/${cleanCid}`,
      { method: 'HEAD', signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
