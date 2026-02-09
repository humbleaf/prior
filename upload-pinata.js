const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function uploadToPinata() {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    console.error('PINATA_JWT not set');
    process.exit(1);
  }

  const formData = new FormData();
  const fileStream = fs.createReadStream('prior-genesis-claim-0.enc');
  formData.append('file', fileStream);
  
  const metadata = JSON.stringify({
    name: 'PRIOR Genesis Claim #0',
    keyvalues: {
      type: 'genesis',
      version: '1.0.0',
      contract: '0x4971ec14D71156Ab945c32238b29969308a022D6'
    }
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1
  });
  formData.append('pinataOptions', options);

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer ' + jwt
      }
    });
    
    console.log('========================================');
    console.log('IPFS UPLOAD SUCCESSFUL');
    console.log('========================================');
    console.log('CID:', res.data.IpfsHash);
    console.log('Size:', res.data.PinSize, 'bytes');
    console.log('Timestamp:', new Date(res.data.Timestamp).toISOString());
    console.log('========================================');
    
    // Save CID
    fs.writeFileSync('.genesis-cid', res.data.IpfsHash);
    console.log('CID saved to .genesis-cid');
    
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

uploadToPinata();
