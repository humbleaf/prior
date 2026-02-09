# Vercel Environment Variables Setup

## ✅ Required Variables (Add in Vercel Dashboard)

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

### Public Variables (NEXT_PUBLIC_)

| Variable | Value | Environments |
|----------|-------|------------|
| `NEXT_PUBLIC_PRIOR_CONTRACT_ADDRESS` | `0x41778EF7E3BAAbE97EbbFE21eE2a6C42Ba7145A5` | Production, Preview, Development |
| `NEXT_PUBLIC_BASE_MAINNET_RPC` | `https://mainnet.base.org` | Production, Preview, Development |

### Server-Side Variables (Hidden from browser)

| Variable | Value | Environments |
|----------|-------|------------|
| `PINATA_JWT` | Your full JWT string | Production, Preview, Development |

**Get PINATA_JWT from:** https://app.pinata.cloud/developers/api-keys
- Create "Scoped Key" for security
- Only enable: `pinFileToIPFS` permission
- No IP allowlist needed (server-side only)

---

## 🔒 Security Improvements

### What Changed:
- ✅ **Pinata JWT**: Now server-side only (was: `NEXT_PUBLIC_PINATA_JWT`)
- ✅ **Alchemy RPC**: Replaced with public Base RPC (no API key leaked)
- ✅ **Uploads**: Rate limited (5/hour per IP)
- ✅ **File size**: Limited to 100MB
- ✅ **Pinata Secret Key**: Removed (not needed)

### What This Prevents:
- ❌ Users can't extract your JWT from browser
- ❌ Users can't directly spam Pinata API
- ❌ Rate limiting enforced server-side

---

## 🚀 After Adding Variables

1. Click **Save**
2. Trigger redeploy (or push new commit)
3. Test upload at `/claim` page

---

## 📁 Files Modified

| File | Purpose |
|------|---------|
| `app/api/upload/route.ts` | Server-side upload proxy with rate limiting |
| `app/api/unpin/route.ts` | Server-side unpin (admin only) |
| `lib/ipfs.ts` | Uses `/api/upload` instead of direct Pinata |

---

## ⚠️ Old vs New

| | Before (Insecure) | After (Secure) |
|---|---|---|
| JWT Location | `NEXT_PUBLIC_PINATA_JWT` (browser) | `PINATA_JWT` (server only) |
| RPC | `your-alchemy-key` exposed | `mainnet.base.org` public |
| Rate Limit | None | 5 uploads/hour per IP |
| File Size | Unlimited | 100MB max |
