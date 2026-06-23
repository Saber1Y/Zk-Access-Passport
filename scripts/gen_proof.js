#!/usr/bin/env node
// Generates a Groth16 proof for a ZK Access Passport circuit.
// Usage: node scripts/gen_proof.js <0|1> <input.json>
//   0 = remit, 1 = rwa
// Output: JSON with pi_a, pi_b, pi_c, publicInputs (all as byte arrays)

const snarkjs = require("snarkjs");
const { buildPoseidon } = require("circomlibjs");
const fs = require("fs");

function toBeBytes(n) {
  const hex = BigInt(n).toString(16).padStart(64, "0");
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2)
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  return bytes;
}

function g1Bytes(pt) {
  return [...toBeBytes(pt[0]), ...toBeBytes(pt[1])];
}

function g2Bytes(pt) {
  const x_re = BigInt(pt[0][0]), x_im = BigInt(pt[0][1]);
  const y_re = BigInt(pt[1][0]), y_im = BigInt(pt[1][1]);
  return [...toBeBytes(x_im), ...toBeBytes(x_re), ...toBeBytes(y_im), ...toBeBytes(y_re)];
}

async function main() {
  const [, , useCaseStr, inputFile] = process.argv;
  if (!useCaseStr || !inputFile) {
    console.error("Usage: node scripts/gen_proof.js <0|1> <input.json>");
    process.exit(1);
  }

  const useCase = parseInt(useCaseStr);
  const circuitName = useCase === 0 ? "remit_pass" : "rwa_pass";
  const inputs = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  // Compute nullifier_hash = Poseidon(credential_secret)
  const poseidon = await buildPoseidon();
  const nullifierHash = poseidon.F.toString(
    poseidon([BigInt(inputs.credential_secret)])
  );
  inputs.nullifier_hash = nullifierHash;

  const wasmPath = `circuits/${circuitName}_js/${circuitName}.wasm`;
  const zkeyPath = `circuits/${circuitName}_final.zkey`;

  console.error(`Generating ${circuitName} proof...`);
  console.error(`  nullifier_hash = ${nullifierHash}`);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmPath,
    zkeyPath
  );

  const result = {
    useCase,
    pi_a: g1Bytes(proof.pi_a),
    pi_b: g2Bytes(proof.pi_b),
    pi_c: g1Bytes(proof.pi_c),
    publicInputs: publicSignals.map(toBeBytes),
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
