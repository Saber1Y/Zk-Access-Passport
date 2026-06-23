#!/usr/bin/env node
// Converts snarkjs VK JSON files to Rust byte-array constants for the Soroban contract.
// Usage: node scripts/convert_vk.js > contracts/zk-access-gate/contracts/zk_access_gate/src/vk.rs

const fs = require('fs');

const remitVk = JSON.parse(fs.readFileSync('circuits/remit_pass_vk.json', 'utf8'));
const rwaVk   = JSON.parse(fs.readFileSync('circuits/rwa_pass_vk.json', 'utf8'));

function toBeBytes(n) {
  const hex = n.toString(16).padStart(64, '0');
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2)
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  return bytes;
}

function g1Bytes(pt) {
  // snarkjs G1: ["x", "y", "1"]
  return [...toBeBytes(BigInt(pt[0])), ...toBeBytes(BigInt(pt[1]))];
}

function g2Bytes(pt) {
  // snarkjs G2: [["x_re","x_im"], ["y_re","y_im"], ["1","0"]]
  // Fp2 encoding: c1 (imaginary) || c0 (real)
  const x_re = BigInt(pt[0][0]), x_im = BigInt(pt[0][1]);
  const y_re = BigInt(pt[1][0]), y_im = BigInt(pt[1][1]);
  return [...toBeBytes(x_im), ...toBeBytes(x_re), ...toBeBytes(y_im), ...toBeBytes(y_re)];
}

function fmtBytes(label, bytes) {
  const hex = bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ');
  return `pub(crate) const ${label}: [u8; ${bytes.length}] = [${hex}];\n`;
}

function fmtIcArray(label, points) {
  const lines = points.map((pt, i) => {
    const b = g1Bytes(pt);
    const hex = b.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ');
    return `    [${hex}],`;
  });
  return `pub(crate) const ${label}: [[u8; 64]; ${points.length}] = [\n${lines.join('\n')}\n];\n`;
}

// ---- Shared ceremony parameters (same for both circuits) ----
let out = `// SPDX-License-Identifier: Unlicense
// Auto-generated from snarkjs VK JSON – do not edit by hand.
// Run: node scripts/convert_vk.js

`;

out += fmtBytes('VK_ALPHA_G1', g1Bytes(remitVk.vk_alpha_1));
out += fmtBytes('VK_BETA_G2',  g2Bytes(remitVk.vk_beta_2));
out += fmtBytes('VK_GAMMA_G2', g2Bytes(remitVk.vk_gamma_2));

// ---- Remit circuit ----
out += `\n// Remit circuit (nPublic=${remitVk.nPublic})\n`;
out += fmtBytes('REMIT_DELTA_G2', g2Bytes(remitVk.vk_delta_2));
out += fmtIcArray('REMIT_IC', remitVk.IC);

// ---- RWA circuit ----
out += `\n// RWA circuit (nPublic=${rwaVk.nPublic})\n`;
out += fmtBytes('RWA_DELTA_G2', g2Bytes(rwaVk.vk_delta_2));
out += fmtIcArray('RWA_IC', rwaVk.IC);

process.stdout.write(out);
