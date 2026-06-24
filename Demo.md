# ZK Access Passport — Demo Video Script

## Video Title

**ZK Access Passport: Private Verification Receipts for Stellar Apps**

## 0:00 — 0:20 | Intro

**On screen:** Dashboard / landing page.

**Voiceover:**

Hi, this is **ZK Access Passport**, a zero-knowledge verification layer for Stellar applications.

The problem we are solving is simple: many financial apps need to know whether a user is eligible to perform an action, but users should not have to reveal sensitive personal data like their passport details, exact age, address, KYC documents, or financial history.

With ZK Access Passport, a user can prove eligibility privately, submit that proof to a Soroban smart contract, and receive a verifiable on-chain receipt that external apps can trust.

---

## 0:20 — 0:45 | Explain the Product

**On screen:** Show simple diagram or dashboard cards: Private Data → ZK Proof → Stellar Verification → Verification Receipt.

**Voiceover:**

Our product does not act as a remittance app or an RWA marketplace.

Instead, it provides the verification layer those apps can consume.

The output is a **ZK Verification Receipt** containing the contract ID, transaction hash, wallet address, policy label, public inputs, nullifier, and verification status.

An external app can use this receipt to confirm that a trusted Stellar contract verified the user’s proof, without ever seeing the user’s private data.

---

## 0:45 — 1:15 | Connect Wallet

**On screen:** Wallet connect section.

**Action:**

Click:

```text
Connect Wallet
```

Show connected Freighter wallet address and Stellar Testnet network.

**Voiceover:**

First, I connect my Stellar wallet using Freighter.

This wallet will sign the Soroban transaction that submits the proof to the deployed contract on Stellar Testnet.

The wallet does not generate the private credential. It only signs the transaction that sends the proof and public inputs to Stellar.

---

## 1:15 — 1:55 | Create Demo Passport

**On screen:** Issue Passport page.

**Action:**

Click:

```text
Load Eligible Alice
```

Show demo identity fields:

```text
Name: Alice
Age: 24
Country: Kenya
KYC Level: 2
Monthly Limit: $1,000
Already Sent: $300
```

Click:

```text
Generate Private Passport
```

**Voiceover:**

For this demo, we use Alice as a sample user.

Alice has private eligibility data such as age, country, KYC level, and transaction limits.

In production, this credential would come from a licensed KYC or compliance provider. For the hackathon demo, we simulate the issuer locally.

The important part is that Alice’s private data is not written to Stellar. It is only used locally to generate a zero-knowledge proof.

---

## 1:55 — 2:35 | Generate ZK Proof

**On screen:** Remittance / eligibility demo page.

**Action:**

Show sample external use-case context:

```text
Use Case: Remittance Eligibility
Action: Alice wants to send $150
Recipient Country: Ghana
Policy: REMIT_KENYA_GHANA_V1
```

Click:

```text
Generate ZK Proof
```

Show proof status.

**Voiceover:**

Now we simulate an external use case.

Imagine a Stellar-based payment app needs to know whether Alice is eligible to send a 150 dollar transfer.

Instead of giving that app her documents, Alice generates a ZK proof.

The proof shows that Alice satisfies the required policy, such as being over the age threshold, having the required KYC level, staying within the allowed amount, and using a fresh nullifier.

The private values stay hidden. The contract only receives the proof, public inputs, and nullifier.

---

## 2:35 — 3:15 | Submit to Stellar

**On screen:** Submit button, Freighter popup, transaction pending/success.

**Action:**

Click:

```text
Submit to Stellar
```

Approve transaction in Freighter.

Show success state.

**Voiceover:**

Next, we submit the proof to the Soroban contract.

Freighter signs the transaction, and the contract verifies the proof on Stellar Testnet.

If the proof is valid, the contract accepts the verification and tracks the nullifier so the same proof cannot be reused.

No private data is decrypted or revealed. The result is simply a cryptographic yes-or-no verification.

---

## 3:15 — 3:55 | Proof Explorer / Verification Receipt

**On screen:** Proof Explorer page.

**Action:**

Show real explorer data:

```text
Status: Verified
Contract ID: CCNE...VGKY
Transaction Hash: 667fa42e...
Wallet: GAPB...NVZZ
Network: Stellar Testnet
Nullifier: ...
Public Inputs: ...
Explorer Link: StellarExpert
```

Click:

```text
Copy Receipt JSON
```

or:

```text
Open in StellarExpert
```

**Voiceover:**

This is the most important part of the app: the Proof Explorer.

The explorer is not mocked. It shows the real end-to-end verification result from the Stellar transaction.

After verification, the app creates a ZK Verification Receipt.

This receipt includes the contract ID, transaction hash, wallet address, policy label, public inputs, nullifier, and status.

An external application can consume this receipt by checking the transaction hash, checking the contract ID, or querying the verification status against our contract.

So instead of asking Alice for her private KYC data, the external app only needs to verify this receipt.

---

## 3:55 — 4:20 | Failure / Replay Protection

**On screen:** Try reused nullifier or invalid proof.

**Action:**

Click:

```text
Try Replay
```

or submit same proof/nullifier again.

Show rejection.

```text
Replay rejected. Nullifier already used.
```

**Voiceover:**

We also support replay protection.

If Alice tries to reuse the same proof or nullifier, the contract rejects it.

This prevents one successful verification from being reused across multiple unauthorized actions.

---

## 4:20 — 4:45 | Closing

**On screen:** Dashboard or final architecture diagram.

**Voiceover:**

To summarize, ZK Access Passport is a private verification layer for Stellar apps.

The real MVP includes wallet connection, ZK proof generation, Soroban contract submission, on-chain proof verification, nullifier tracking, and a real Proof Explorer.

The remittance and RWA screens are practical examples of external products that could consume our verification receipts.

Our goal is to make compliance and eligibility checks reusable, private, and verifiable on Stellar.

Thank you.
