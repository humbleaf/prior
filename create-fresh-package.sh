#!/bin/bash
# Create fresh PRIOR Timeless Package v1.0.2

PACKAGE_DIR="prior-timeless-v1.0.2"
TAR_NAME="prior-genesis-claim-0.tar.gz"

echo "Creating fresh Timeless Package..."
echo ""

# Clean up old package
rm -rf "$PACKAGE_DIR" "$TAR_NAME"

# Create structure
mkdir -p "$PACKAGE_DIR"/{dist,contracts,scripts,docs,keys}

# Copy current build
cp -r dist/* "$PACKAGE_DIR/dist/" 2>/dev/null || echo "No dist folder - run npm run build first"

# Copy contracts
cp contracts/src/PRIORTeslaClaim.sol "$PACKAGE_DIR/contracts/"
cp contracts/script/DeployFresh.s.sol "$PACKAGE_DIR/scripts/"
cp contracts/script/FileSystemClaim.s.sol "$PACKAGE_DIR/scripts/"

# Copy docs
cp GENESIS_CLAIM.md "$PACKAGE_DIR/docs/" 2>/dev/null
cp README.md "$PACKAGE_DIR/" 2>/dev/null

# Create genesis key file
cat > "$PACKAGE_DIR/keys/GENESIS_KEY.txt" << 'EOF'
PRIOR_GENESIS_SEED

This is the decryption key for the PRIOR Genesis Claim.
Published via: 
- Base Mainnet blockchain (Claim #0)
- Bitcoin OP_RETURN (pending)
- This file

Decryption:
openssl enc -aes-256-cbc -d -in prior-genesis-claim-0.enc -out package.tar.gz -k "PRIOR_GENESIS_SEED" -pbkdf2 -iter 100000
EOF

# Create contracts info
cat > "$PACKAGE_DIR/CONTRACTS.txt" << 'EOF'
PRIOR Contract Deployments
==========================

TRUE Genesis Claim #0:
  Contract: 0x41778EF7E3BAAbE97EbbFE21eE2a6C42Ba7145A5
  Network: Base Mainnet (Chain ID: 8453)
  Tx: 0xc605975d245f3d840426562caba6b6a406f690c5d77f3b9e95140b8872862b1f
  Block: 41912056
  Filed: 2026-02-08 22:56 CST

Legacy Claim #1:
  Contract: 0x4971ec14D71156Ab945c32238b29969308a022D6 (OLD)
  Note: IV encryption bug, undecryptable but timestamp valid

Salt used: PRIOR_GENESIS_2026_02_TESLA_MONUMENT
EOF

# Create tarball
tar -czf "$TAR_NAME" "$PACKAGE_DIR/"

# Show results
echo ""
echo "=== Package Created ==="
ls -lh "$TAR_NAME"
echo ""
echo "SHA-256:"
shasum -a 256 "$TAR_NAME"
echo ""
echo "Contents:"
tar -tzf "$TAR_NAME" | head -10
echo "..."

# Cleanup
rm -rf "$PACKAGE_DIR"

echo ""
echo "✅ Fresh package ready: $TAR_NAME"
