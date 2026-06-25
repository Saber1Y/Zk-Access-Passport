# ZK Access Passport

Zero-knowledge proof-based compliance system on Stellar Soroban. Prove age, KYC level, remittance limits, and investor eligibility without revealing private data.

Two verified use cases:
- **Remittance** — Cross-border payment compliance (Kenya → Ghana corridor)
- **RWA Investment** — Tokenized real-world asset eligibility

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
- **Contract**: Soroban contract on Stellar testnet — verifies proofs, enforces nullifier replay protection
- **Frontend**: Next.js app — credential creation, proof generation, contract submission via Freighter

## Prerequisites

- **Node.js** 20+
- **Stellar CLI** — `curl -fsSL https://stellar.org/cli/install.sh | sh`
- **Freighter** browser wallet (Stellar Testnet)
- **Make**

## Setup

### 1. Circuits

```bash
cd circuits
make setup   # downloads powers of tau (only once)
make build   # compiles circom → r1cs, wasm, zkey
make vk      # exports verification key
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
make build
make deploy-testnet
```

The deployed contract address is in `frontend/src/lib/constants.ts`:

```
CONTRACT_ID = CBDVEJZHVL63X4IY36NUURN6NBNVUYOLR6CR6HLOYWD5QJBGWIBMPNCM
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev   # starts on :3000
```

Open `http://localhost:3000` in your browser.

## Testing

Start both the backend and frontend:

```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
cd frontend && npm run dev
```

### CLI test

```bash
node scripts/test_contract.js
```

This generates a remittance proof and invokes the contract. The credential secret is hardcoded in the test script — each secret can only be used once (nullifier protection).

### Frontend flow

1. Open `http://localhost:3000`
2. Connect Freighter wallet (Stellar Testnet)
3. **Issue Passport** — fill in a demo user, click Generate Private Passport
4. **Remittance** — set amount, generate proof, submit to Stellar
5. **RWA Investment** — select an asset, generate proof, submit
6. **Proof Explorer** — inspect public vs hidden data

Each passport generates a fresh credential secret. Once its proof is accepted on-chain, the nullifier is stored and that passport cant be reused. Create a new passport for each submission.

## How It Works

1. **Credential** — private data (age, KYC, limits) stays in browser localStorage
2. **Proof generation** — backend runs the Circom circuit (witness + Groth16 prover)
3. **Nullifier** — Poseidon hash of credential_secret, prevents double-spending
4. **Contract submission** — frontend builds a Soroban tx via `@stellar/stellar-sdk`, signs with Freighter, submits to testnet
5. **Verification** — contract does a BN254 pairing check + nullifier check; passes or panics

## Contract

| Contract | Address |
|----------|---------|
| Production | `CBDVEJZHVL63X4IY36NUURN6NBNVUYOLR6CR6HLOYWD5QJBGWIBMPNCM` |
| Network | Stellar Testnet |

## Notes

- Only the proof verification tx and nullifier go on-chain. Identity data stays local.
- The remittance "over-limit" button is intentionally meant to fail (shows the circuit catching it).
- Mobile: sidebar collapses to a hamburger menu. Wallet address/network hidden on small screens.
