#!/bin/bash
# Test if existing .enc file can be decrypted
# OpenSSL format: Salted__ + salt(8) + ciphertext

echo "=== Testing OpenSSL Decryption ==="
echo "File: prior-genesis-claim-0.enc"
echo "Password: PRIOR_GENESIS_SEED"
echo ""

# Check file header
echo "Header (first 16 bytes):"
xxd -l 16 prior-genesis-claim-0.enc

# Try OpenSSL decryption
openssl enc -aes-256-cbc -d -in prior-genesis-claim-0.enc -out test-openssl.tar.gz -k "PRIOR_GENESIS_SEED" -pbkdf2 -iter 100000 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ OpenSSL decryption SUCCESSFUL!"
    ls -lh test-openssl.tar.gz
    
    # Verify integrity
    ORIG_HASH=$(shasum -a 256 prior-genesis-claim-0.tar.gz | awk '{print $1}')
    NEW_HASH=$(shasum -a 256 test-openssl.tar.gz | awk '{print $1}')
    
    echo ""
    echo "Original SHA-256: $ORIG_HASH"
    echo "Decrypted SHA-256: $NEW_HASH"
    
    if [ "$ORIG_HASH" = "$NEW_HASH" ]; then
        echo "✅ INTEGRITY VERIFIED — Files match!"
    else
        echo "❌ Hash mismatch — different files"
    fi
    
    # Cleanup
    rm test-openssl.tar.gz
else
    echo ""
    echo "❌ Decryption failed — wrong password or different format"
fi
