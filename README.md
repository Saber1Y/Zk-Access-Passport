# ZK Access Passport

Zero-knowledge proof-based compliance system on Stellar Soroban. Prove age, KYC level, remittance limits, and investor eligibility without revealing private data.

Two verifiable use cases:
- **Remittance** (use_case=0) — Cross-border payment compliance
- **RWA Investment** (use_case=1) — Tokenized real-world asset eligibility

## Architecture

```
User (Freighter wallet)
  │
  ├── Frontend (Next.js) ──► Backend (Express) ──► snarkjs (proof generation)
  │                              │
  └── Soroban Contract (verify) ◄─ (proof submission)
```

- **Circuits**: `circuits/remit_pass.circom` and `circuits/rwa_pass.circom`
- **Backend**: Express server on `:3001` — generates Groth16 proofs via snarkjs
- **Contract**: Soroban contract deployed on Stellar testnet — verifies proofs and enforces nullifier replay protection
- **Frontend**: Next.js app — credential creation, proof generation, and contract submission via Freighter

## Prerequisites

- **Node.js** 20+
- **Stellar CLI** — `curl -fsSL https://stellar.org/cli/install.sh | sh`
- **Freighter** browser wallet (Stellar Testnet)
- **Make** / bash

## Setup

### 1. Circuits

```bash
# Build both circuits
cd circuits
make setup   # downloads powers of tau (only once)
make build   # compiles circom → r1cs, wasm, zkey
make vk      # exports verification key (contract uses this)
```

### 2. Backend

```bash
cd backend
npm install
node server.js   # starts on :3001
```

### 3. Contract

```bash
cd contracts/zk-access-gate
make build          # compiles rust → wasm
make deploy-testnet # deploys to Stellar testnet
```

The deployed contract address is in `src/lib/constants.ts`:

```
CONTRACT_ID = CCKL3ERP3P3J33Q6YD5J2ZEEIZ7GOHDEJ2W2QQJJ2LQSYYBBW7NJRNOX
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev   # starts on :3000
```

Open `http://localhost:3000` in your browser.

## Testing

### Generate and verify proofs (CLI)

```bash
# Both terminals:
cd backend && node server.js

# Terminal 2:
node scripts/test_contract.js     # REMIT verification
node scripts/test_rwa_contract.js  # RWA verification
```

Each `credential_secret` can only be used once (nullifier replay protection). Change the value in the test script to re-test.

### Frontend demo

1. Open `http://localhost:3000`
2. Connect Freighter wallet (Stellar Testnet)
3. Go to **Issue Passport** — fill in your credential (or use a preset)
4. **Remittance** — set amount, generate proof, submit to contract
5. **RWA Investment** — set investment amount, generate proof, submit
6. **Proof Explorer** — inspect public vs. hidden data

### Manual contract invocation

```bash
stellar contract invoke \
  --id CCKL3ERP3P3J33Q6YD5J2ZEEIZ7GOHDEJ2W2QQJJ2LQSYYBBW7NJRNOX \
  --source zk_access_gate \
  --network testnet \
  -- \
  verify \
  --use_case 0 \
  --pi_a <64-byte-hex> \
  --pi_b <128-byte-hex> \
  --pi_c <64-byte-hex> \
  --public_inputs '["<32-byte-hex>", ...]'
```

## How It Works

1. **Credential** — user's private data (age, KYC, limits) stored in browser localStorage
2. **Proof generation** — backend runs the Circom circuit (witness + Groth16 prover), returns `pi_a/b/c` and public inputs
3. **Nullifier** — Poseidon hash of `credential_secret`, used to prevent double-spending
4. **Contract submission** — frontend builds a Soroban transaction via `@stellar/stellar-sdk`, signs with Freighter, submits to testnet
5. **Verification** — contract performs BN254 pairing check + nullifier exhaustion check; returns the public inputs on success or panics on failure

## Contract

| Contract | Address |
|----------|---------|
| Production | `CCKL3ERP3P3J33Q6YD5J2ZEEIZ7GOHDEJ2W2QQJJ2LQSYYBBW7NJRNOX` |
| Debug | N/A (deleted) |

Both proofs verified successfully at the above production address.
