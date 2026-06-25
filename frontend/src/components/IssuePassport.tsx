"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  HiOutlineLockClosed,
  HiOutlineGlobeAlt,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import Stepper from "./Stepper";

export default function IssuePassport() {
  const {
    credential,
    setCredential,
    status,
    saveCredential,
    reset,
    setTab,
  } = useApp();
  const [saved, setSaved] = useState(status === "credential_created");

  function handleSave() {
    setCredential({ ...credential, credential_secret: String(Math.floor(Math.random() * 1_000_000_000)) })
    reset();
    saveCredential();
    setSaved(true);
  }

  const steps = [
    { label: "Create Passport", done: saved, active: !saved },
    { label: "Generate Proof", done: false, active: saved },
    { label: "Verify on Stellar", done: false, active: false },
    { label: "Execute Action", done: false, active: false },
  ];

  return (
    <div>
      <h2
        style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}
      >
        Issue Passport
      </h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Create a private compliance credential. Your data never leaves your
        device.
      </p>

      <Stepper steps={steps} />

      <div className="two-col" style={{ display: "flex", gap: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <div className="card">
            <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>
              Create Demo User
            </h3>

            <div className="form-row">
              <div>
                <label>Name</label>
                <input
                  type="text"
                  value={credential.name}
                  onChange={(e) =>
                    setCredential({ ...credential, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Age</label>
                <input
                  type="number"
                  value={credential.age}
                  onChange={(e) =>
                    setCredential({ ...credential, age: +e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Country</label>
                <input
                  type="text"
                  value={credential.country}
                  onChange={(e) =>
                    setCredential({ ...credential, country: e.target.value })
                  }
                />
              </div>
              <div>
                <label>KYC Level</label>
                <select
                  value={credential.kyc_level}
                  onChange={(e) =>
                    setCredential({ ...credential, kyc_level: +e.target.value })
                  }
                >
                  <option value={0}>0 — None</option>
                  <option value={1}>1 — Basic</option>
                  <option value={2}>2 — Enhanced</option>
                  <option value={3}>3 — Institutional</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Monthly Remittance Limit ($)</label>
                <input
                  type="number"
                  value={credential.monthly_limit}
                  onChange={(e) =>
                    setCredential({
                      ...credential,
                      monthly_limit: +e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Already Sent This Month ($)</label>
                <input
                  type="number"
                  value={credential.already_sent}
                  onChange={(e) =>
                    setCredential({
                      ...credential,
                      already_sent: +e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Max RWA Investment ($)</label>
                <input
                  type="number"
                  value={credential.max_investment}
                  onChange={(e) =>
                    setCredential({
                      ...credential,
                      max_investment: +e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Restricted Investor</label>
                <select
                  value={credential.restricted ? "yes" : "no"}
                  onChange={(e) =>
                    setCredential({
                      ...credential,
                      restricted: e.target.value === "yes",
                    })
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                onClick={handleSave}
                style={{
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
                  // maxWidth: 320,
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Generate Private Passport
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!saved ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "3rem 1.5rem" }}
            >
              <p style={{ color: "#999", fontSize: "0.9rem" }}>
                No passport generated yet.
              </p>
              <p
                style={{
                  color: "#bbb",
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                }}
              >
                Fill in the form and click &apos;Generate Private
                Passport&apos;.
              </p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "0.75rem",
                    color: "#059669",
                  }}
                >
                  Private Passport Created
                </h3>
                <div
                  style={{
                    fontSize: "0.82rem",
                    marginBottom: "0.75rem",
                    background: "#f0fdf4",
                    borderRadius: 6,
                    padding: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span style={{ color: "#666" }}>Credential Commitment</span>
                    <code style={{ fontSize: "0.75rem" }}>0x8fa3...91c2</code>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span style={{ color: "#666" }}>Issuer</span>
                    <span>Demo KYC Provider</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#666" }}>Status</span>
                    <span style={{ color: "#059669", fontWeight: 600 }}>
                      Ready to generate proofs
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4
                  style={{
                    fontSize: "0.85rem",
                    marginBottom: "0.75rem",
                    color: "#d97706",
                  }}
                >
                  <HiOutlineLockClosed
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />{" "}
                  Private Data — never sent to chain
                </h4>
                <table style={{ width: "100%", fontSize: "0.82rem" }}>
                  <tbody>
                    {[
                      ["Name", credential.name],
                      ["Age", String(credential.age)],
                      ["Country", credential.country],
                      ["KYC Level", String(credential.kyc_level)],
                      ["Monthly Limit", `$${credential.monthly_limit}`],
                      ["Already Sent", `$${credential.already_sent}`],
                      ["Max Investment", `$${credential.max_investment}`],
                      ["Restricted", credential.restricted ? "Yes" : "No"],
                    ].map(([label, val]) => (
                      <tr key={label}>
                        <td style={{ color: "#888", padding: "0.2rem 0" }}>
                          {label}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 500 }}>
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <h4
                  style={{
                    fontSize: "0.85rem",
                    marginBottom: "0.75rem",
                    color: "#6366f1",
                  }}
                >
                  <HiOutlineGlobeAlt
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />{" "}
                  Demo Public Data
                </h4>
                <table style={{ width: "100%", fontSize: "0.82rem" }}>
                  <tbody>
                    {[
                      ["Credential Commitment", "0x8fa3...91c2"],
                      ["Merkle Root", "0x4567...def"],
                      ["Issuer ID", "demo_kyc_provider_01"],
                    ].map(([label, val]) => (
                      <tr key={label}>
                        <td style={{ color: "#888", padding: "0.2rem 0" }}>
                          {label}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                          }}
                        >
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#666",
                    marginTop: "0.5rem",
                    fontStyle: "italic",
                  }}
                >
                  Only the proof verification and nullifier go on-chain.
                  Identity details and credentials remain private and local to
                  the app.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setTab("remittance")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
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
                  Send Remittance <HiOutlineArrowRight />
                </button>
                <button
                  onClick={() => setTab("rwa")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
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
                  Invest in RWA <HiOutlineArrowRight />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
