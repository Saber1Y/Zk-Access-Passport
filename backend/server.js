import express from 'express'
import cors from 'cors'
import * as snarkjs from 'snarkjs'
import { buildPoseidon } from 'circomlibjs'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CIRCUITS = resolve(__dirname, '..', 'circuits')

const wasmCache = {}
const zkeyCache = {}

function loadCircuit(name) {
  if (!wasmCache[name]) {
    wasmCache[name] = readFileSync(`${CIRCUITS}/${name}_js/${name}.wasm`)
    zkeyCache[name] = readFileSync(`${CIRCUITS}/${name}_final.zkey`)
  }
  return { wasm: wasmCache[name], zkey: zkeyCache[name] }
}

const app = express()
app.use(cors())
app.use(express.json())

let poseidon
app.post('/api/prove', async (req, res) => {
  try {
    const { useCase, inputs } = req.body
    const name = useCase === 0 ? 'remit_pass' : 'rwa_pass'

    if (!poseidon) poseidon = await buildPoseidon()
    const nh = poseidon.F.toString(poseidon([BigInt(inputs.credential_secret)]))
    inputs.nullifier_hash = nh

    const { wasm, zkey } = loadCircuit(name)
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs, new Uint8Array(wasm), new Uint8Array(zkey),
    )

    function toBytes(n) {
      const hex = BigInt(n).toString(16).padStart(64, '0')
      const a = new Array(32)
      for (let i = 0; i < 32; i++)
        a[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      return a
    }

    function g1Bytes(pt) {
      return [...toBytes(pt[0]), ...toBytes(pt[1])]
    }

    function g2Bytes(pt) {
      const xr = BigInt(pt[0][0]), xi = BigInt(pt[0][1])
      const yr = BigInt(pt[1][0]), yi = BigInt(pt[1][1])
      return [...toBytes(xi), ...toBytes(xr), ...toBytes(yi), ...toBytes(yr)]
    }

    res.json({
      useCase,
      pi_a: g1Bytes(proof.pi_a),
      pi_b: g2Bytes(proof.pi_b),
      pi_c: g1Bytes(proof.pi_c),
      publicInputs: publicSignals.map(toBytes),
    })
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

app.listen(3001, () => {
  console.log('ZK Access Passport backend on :3001')
})
