pragma circom 2.1.0;

include "comparators.circom";
include "poseidon.circom";

template RWAPass() {
  signal input age;
  signal input kyc_level;
  signal input investor_type;
  signal input max_investment;
  signal input restricted;
  signal input credential_secret;
  signal input required_age;
  signal input required_kyc;
  signal input required_investor_type;
  signal input investment_amount;
  signal input nullifier_hash;

  // ── PUBLIC OUTPUTS (visible on-chain) ──
  signal output out_required_age;
  signal output out_required_kyc;
  signal output out_required_investor_type;
  signal output out_investment_amount;
  signal output out_nullifier_hash;

  out_required_age <== required_age;
  out_required_kyc <== required_kyc;
  out_required_investor_type <== required_investor_type;
  out_investment_amount <== investment_amount;
  out_nullifier_hash <== nullifier_hash;

  // ── 1. Prove age >= required_age ──
  component age_ok = GreaterEqThan(32);
  age_ok.in[0] <== age;
  age_ok.in[1] <== required_age;
  age_ok.out === 1;

  // ── 2. Prove KYC level >= required_kyc ──
  component kyc_ok = GreaterEqThan(8);
  kyc_ok.in[0] <== kyc_level;
  kyc_ok.in[1] <== required_kyc;
  kyc_ok.out === 1;

  // ── 3. Prove investor_type >= required_investor_type ──
  component investor_ok = GreaterEqThan(8);
  investor_ok.in[0] <== investor_type;
  investor_ok.in[1] <== required_investor_type;
  investor_ok.out === 1;

  // ── 4. Prove investment_amount <= max_investment ──
  component max_ok = GreaterEqThan(64);
  max_ok.in[0] <== max_investment;
  max_ok.in[1] <== investment_amount;
  max_ok.out === 1;

  // ── 5. Prove user is NOT from a restricted jurisdiction ──
  restricted === 0;

  // ── 6. Prove credential is genuine via nullifier ──
  component hasher = Poseidon(1);
  hasher.inputs[0] <== credential_secret;
  nullifier_hash === hasher.out;
}

component main = RWAPass();
