export interface ProofResult {
  useCase: number
  pi_a: number[]
  pi_b: number[]
  pi_c: number[]
  publicInputs: number[][]
}

export async function generateProof(
  useCase: number,
  inputs: Record<string, string | number>
): Promise<ProofResult> {
  const res = await fetch("/api/prove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ useCase, inputs }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  return res.json()
}

export function bytesToHex(bytes: number[]): string {
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("")
}
