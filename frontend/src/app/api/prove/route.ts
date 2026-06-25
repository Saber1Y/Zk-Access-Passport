import { NextRequest, NextResponse } from 'next/server'
// @ts-expect-error no types
import * as snarkjs from 'snarkjs'
// @ts-expect-error no types
import { buildPoseidon } from 'circomlibjs'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export const runtime = 'nodejs'

const CIRCUITS = resolve(process.cwd(), 'circuits')

const wasmCache: Record<string, Buffer> = {}
const zkeyCache: Record<string, Buffer> = {}

function loadCircuit(name: string) {
  if (!wasmCache[name]) {
    wasmCache[name] = readFileSync(resolve(CIRCUITS, `${name}.wasm`))
    zkeyCache[name] = readFileSync(resolve(CIRCUITS, `${name}_final.zkey`))
  }
  return { wasm: wasmCache[name], zkey: zkeyCache[name] }
}

let poseidonPromise: Promise<any> | null = null

function inputToBigInt(v: string | number): bigint {
  return BigInt(v)
}

export async function POST(req: NextRequest) {
  try {
    const { useCase, inputs } = await req.json()
    const name = useCase === 0 ? 'remit_pass' : 'rwa_pass'

    if (!poseidonPromise) poseidonPromise = buildPoseidon()
    const poseidon = await poseidonPromise
    const nh = poseidon.F.toString(poseidon([inputToBigInt(inputs.credential_secret)]))
    inputs.nullifier_hash = nh

    const { wasm, zkey } = loadCircuit(name)
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs, new Uint8Array(wasm), new Uint8Array(zkey),
    )

    function toBytes(n: string) {
      const hex = BigInt(n).toString(16).padStart(64, '0')
      const a = new Array<number>(32)
      for (let i = 0; i < 32; i++)
        a[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      return a
    }

    function g1Bytes(pt: any) {
      return [...toBytes(pt[0]), ...toBytes(pt[1])]
    }

    function g2Bytes(pt: any) {
      return [...toBytes(pt[0][0].toString()), ...toBytes(pt[0][1].toString()),
              ...toBytes(pt[1][0].toString()), ...toBytes(pt[1][1].toString())]
    }

    return NextResponse.json({
      useCase,
      pi_a: g1Bytes(proof.pi_a),
      pi_b: g2Bytes(proof.pi_b),
      pi_c: g1Bytes(proof.pi_c),
      publicInputs: publicSignals.map(toBytes),
    })
  } catch (e: any) {
    console.error(e)
    return new NextResponse(e.message, { status: 500 })
  }
}
