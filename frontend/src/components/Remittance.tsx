"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { generateProof, bytesToHex } from "@/lib/prove";
import { submitProof } from "@/lib/submit";
import { CONTRACT_ID } from "@/lib/constants";
import { useFreighter } from "@/hooks/useFreighter";
import Stepper from "./Stepper";

export default function Remittance() {
  const {
    credential,
    status,
    setStatus,
    proof,
    setProof,
    setLastTxHash,
    setLastError,
    lastTxHash,
    lastError,
    setUseCase,
    setSubmittedAt,
  } = useApp();
  const freighter = useFreighter();

  const [recipient, setRecipient] = useState("Bob");
  const [recipientCountry, setRecipientCountry] = useState("Ghana");
  const [amount, setAmount] = useState(150);
  const [loading, setLoading] = useState(false);
  const [overLimitDemo, setOverLimitDemo] = useState(false);

  useEffect(() => {
    setUseCase(0);
  }, [setUseCase]);

  const hasCred = status !== "idle";

  const steps = [
    { label: "Create Passport", done: hasCred, active: false },
    { label: "Enter Payment", done: proof !== null, active: !proof && hasCred },
    {
      label: "Generate Proof",
      done: proof !== null && lastTxHash === "",
      active: proof !== null && lastTxHash === "",
    },
    {
      label: "Submit to Stellar",
      done: lastTxHash !== "",
      active: lastTxHash === "" && proof !== null,
    },
    {
      label: "Verification Receipt",
      done: lastTxHash !== "" && !lastError,
      active: false,
    },
  ];

  async function handleProve() {
    setLoading(true);
    setLastError("");
    setProof(null);
    setLastTxHash("");
    try {
      const effectiveAmount = overLimitDemo ? 900 : amount;
      const p = await generateProof(0, {
        age: credential.age,
        kyc_level: credential.kyc_level,
        already_sent: credential.already_sent,
        monthly_limit: credential.monthly_limit,
        credential_secret: credential.credential_secret,
        required_age: 18,
        required_kyc: 2,
        amount: effectiveAmount,
      });
      setProof(p);
      setStatus("proof_generated");
    } catch (e: unknown) {
      setLastError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setLastError("");
    try {
      if (!freighter.connected)
        throw new Error("Connect Freighter wallet first");
      if (!proof) throw new Error("No proof to submit");

      const result = await submitProof({
        useCase: 0,
        piA: proof.pi_a,
        piB: proof.pi_b,
        piC: proof.pi_c,
        publicInputs: proof.publicInputs,
        publicKey: freighter.address,
      });

      setLastTxHash(result.hash);
      setSubmittedAt(Date.now());
      setStatus("verified");
    } catch (e: unknown) {
      setLastError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  }

  function handleOverLimit() {
    setOverLimitDemo(true);
    setAmount(900);
    setProof(null);
    setLastTxHash("");
    setLastError("");
    setStatus("credential_created");
  }

  return (
    <div>
      <h2
        style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}
      >
        Send Private-Compliant Remittance
      </h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Prove eligibility to send money across borders without revealing private
        data.
      </p>

      <Stepper steps={steps} />

      <div style={{ display: "flex flex-col", gap: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <div className="card">
            <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>
              Payment Details
            </h3>

            <div className="form-row">
              <div>
                <label>Sender</label>
                <input type="text" value={credential.name} disabled />
              </div>
              <div>
                <label>Recipient</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Recipient Country</label>
                <input
                  type="text"
                  value={recipientCountry}
                  onChange={(e) => setRecipientCountry(e.target.value)}
                />
              </div>
              <div>
                <label>Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(+e.target.value);
                    setOverLimitDemo(false);
                  }}
                />
              </div>
            </div>

            <div>
              <label>Asset</label>
              <input
                type="text"
                value="Mock USDC on Stellar Testnet"
                disabled
              />
            </div>

            <div>
              <label>Policy</label>
              <input
                type="text"
                value="Kenya → Ghana Remittance Policy"
                disabled
              />
            </div>

            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}
            >
              <button
                onClick={handleProve}
                disabled={loading || !hasCred}
                style={{
                  flex: 1,
                  background: "#1a1a2e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.50rem 2rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  width: "100%",
                }}
              >
                {loading ? "Generating Proof..." : "Generate Remittance Proof"}
              </button>
              {proof && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ flex: 1, background: "#059669" }}
                >
                  {loading ? "Submitting..." : "Submit Payment to Stellar"}
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #eee",
              }}
            >
              <button
                onClick={handleOverLimit}
                style={{
                  width: "100%",
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  padding: "0.5rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try Over-Limit Transfer ($900)
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!proof && !lastError && (
            <div
              className="card"
              style={{ textAlign: "center", padding: "3rem 1.5rem" }}
            >
              <p style={{ color: "#999", fontSize: "0.9rem" }}>
                {hasCred
                  ? "Enter payment details and generate a proof."
                  : "No credential found. Issue a passport first."}
              </p>
            </div>
          )}

          {lastError && (
            <div className="card">
              <h3
                style={{
                  color: "#dc2626",
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                }}
              >
                Rejected
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#555",
                  marginBottom: "0.5rem",
                }}
              >
                Reason:
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  background: "#fef2f2",
                  padding: "0.75rem",
                  borderRadius: 6,
                  fontFamily: "monospace",
                }}
              >
                {lastError}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#888",
                  marginTop: "0.5rem",
                  fontStyle: "italic",
                }}
              >
                The smart contract rejected the proof. No transaction was
                submitted.
              </p>
            </div>
          )}

          {proof && !lastError && !lastTxHash && (
            <div className="card">
              <h3
                style={{
                  color: "#6366f1",
                  fontSize: "0.95rem",
                  marginBottom: "0.75rem",
                }}
              >
                Remittance Proof Generated
              </h3>
              <div style={{ fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                <p
                  style={{
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                    color: "#059669",
                  }}
                >
                  Verified by circuit:
                </p>
                <ul
                  style={{
                    paddingLeft: "1.25rem",
                    color: "#555",
                    lineHeight: 1.6,
                  }}
                >
                  <li>✓ Age threshold (≥ 18)</li>
                  <li>✓ KYC level (≥ 2)</li>
                  <li>
                    ✓ ${credential.already_sent} + ${amount} ≤ $
                    {credential.monthly_limit}
                  </li>
                  <li>✓ Fresh nullifier (replay protected)</li>
                </ul>
                <p
                  style={{
                    fontWeight: 600,
                    margin: "0.75rem 0 0.25rem 0",
                    color: "#d97706",
                  }}
                >
                  Demo policy context:
                </p>
                <ul
                  style={{
                    paddingLeft: "1.25rem",
                    color: "#888",
                    lineHeight: 1.6,
                  }}
                >
                  <li>○ Kenya → Ghana corridor</li>
                  <li>○ Demo KYC provider issuer</li>
                </ul>
              </div>
              <h4
                style={{
                  fontSize: "0.8rem",
                  color: "#6366f1",
                  marginBottom: "0.4rem",
                }}
              >
                Demo Public Inputs
              </h4>
              <table
                style={{
                  width: "100%",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ color: "#888", padding: "0.15rem 0" }}>
                      Policy ID
                    </td>
                    <td style={{ textAlign: "right" }}>REMIT_KENYA_GHANA_V1</td>
                  </tr>
                  {proof.publicInputs.map((pi, i) => (
                    <tr key={i}>
                      <td style={{ color: "#888", padding: "0.15rem 0" }}>
                        {["Age ≥", "KYC ≥", "Amount ($)", "Nullifier"][i]}
                      </td>
                      <td style={{ textAlign: "right" }}>{bytesToHex(pi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#999",
                  marginTop: "0.5rem",
                  fontStyle: "italic",
                }}
              >
                Only the proof verification transaction and nullifier are
                submitted on-chain in this MVP.
              </p>
            </div>
          )}

          {lastTxHash &&
            !lastError &&
            proof &&
            (() => {
              const nullifier = bytesToHex(
                proof.publicInputs[proof.publicInputs.length - 1],
              );
              const receipt = {
                status: "VERIFIED",
                network: "stellar-testnet",
                contract_id: CONTRACT_ID,
                tx_hash: lastTxHash,
                wallet: freighter.address,
                policy_id: "REMIT_KENYA_GHANA_V1",
                nullifier_hash: nullifier,
                verified_at: new Date().toISOString(),
                explorer_url: `https://stellar.expert/explorer/testnet/tx/${lastTxHash}`,
              };
              const receiptJson = JSON.stringify(receipt, null, 2);
              return (
                <div className="card">
                  <h3
                    style={{
                      color: "#059669",
                      fontSize: "0.95rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Verification Receipt
                  </h3>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      background: "#f0fdf4",
                      borderRadius: 6,
                      padding: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <p style={{ color: "#059669" }}>
                      ✓ Proof verified on Stellar
                    </p>
                    <p style={{ color: "#059669" }}>✓ Nullifier accepted</p>
                    <p style={{ color: "#059669" }}>✓ Receipt created</p>
                    <p style={{ color: "#059669" }}>
                      ✓ Ready for external app verification
                    </p>
                  </div>

                  <table
                    style={{
                      width: "100%",
                      fontSize: "0.78rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <tbody>
                      {[
                        ["Status", "VERIFIED", "#059669"],
                        ["Network", "Stellar Testnet"],
                        [
                          "Contract ID",
                          `${CONTRACT_ID.slice(0, 8)}...${CONTRACT_ID.slice(-4)}`,
                          "mono",
                        ],
                        [
                          "Transaction Hash",
                          `${lastTxHash.slice(0, 8)}...${lastTxHash.slice(-4)}`,
                          "mono",
                        ],
                        [
                          "Wallet",
                          `${freighter.address.slice(0, 6)}...${freighter.address.slice(-4)}`,
                          "mono",
                        ],
                        ["Policy", "REMIT_KENYA_GHANA_V1"],
                        ["Nullifier", `${nullifier.slice(0, 10)}...`, "mono"],
                      ].map(([label, val, cls]) => (
                        <tr key={label}>
                          <td
                            style={{
                              color: "#888",
                              padding: "0.25rem 0.5rem 0.25rem 0",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {label}
                          </td>
                          <td
                            style={{
                              padding: "0.25rem 0",
                              fontFamily:
                                cls === "mono" ? "monospace" : undefined,
                              fontWeight: cls === "#059669" ? 600 : undefined,
                              color: cls?.startsWith("#") ? cls : undefined,
                            }}
                          >
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <pre
                    style={{
                      fontSize: "0.72rem",
                      background: "#1e1e2e",
                      color: "#cdd6f4",
                      padding: "0.75rem",
                      borderRadius: 6,
                      overflow: "auto",
                      maxHeight: 200,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {receiptJson}
                  </pre>

                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => navigator.clipboard.writeText(receiptJson)}
                      style={copyBtnStyle}
                    >
                      Copy Receipt JSON
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(lastTxHash)}
                      style={copyBtnStyle}
                    >
                      Copy Tx Hash
                    </button>
                    <a
                      href={receipt.explorer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...copyBtnStyle,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Open Explorer ↗
                    </a>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

const copyBtnStyle: React.CSSProperties = {
  background: "#1a1a2e",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "0.4rem 0.85rem",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s",
};
