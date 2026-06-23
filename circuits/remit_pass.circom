pragma circom 2.1.0;

include "comparators.circom";
include "poseidon.circom";

template RemitPass() {
  // Inputs — all are private by default in Circom.
  // We'll mark which ones are public when generating the proof with snarkjs.
  signal input age;
  signal input kyc_level;
  signal input already_sent;
  signal input monthly_limit;
  signal input credential_secret;
  signal input required_age;
  signal input required_kyc;
  signal input amount;
  signal input nullifier_hash;

  // ── 1. Prove age >= required_age (e.g., 18) ──
  component age_ok = GreaterEqThan(32);
  age_ok.in[0] <== age;
  age_ok.in[1] <== required_age;
  age_ok.out === 1;

  // ── 2. Prove KYC level >= required_kyc (e.g., 2) ──
  component kyc_ok = GreaterEqThan(8);
  kyc_ok.in[0] <== kyc_level;
  kyc_ok.in[1] <== required_kyc;
  kyc_ok.out === 1;

  // ── 3. Prove already_sent + amount <= monthly_limit ──
  component limit_ok = GreaterEqThan(64);
  limit_ok.in[0] <== monthly_limit;
  limit_ok.in[1] <== already_sent + amount;
  limit_ok.out === 1;

  // ── 4. Prove credential is genuine via nullifier ──
  component hasher = Poseidon(1);
  hasher.inputs[0] <== credential_secret;
  nullifier_hash === hasher.out;
}

component main = RemitPass();
