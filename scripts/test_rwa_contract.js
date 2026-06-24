// Test RWA proof on contract
import { spawnSync } from 'child_process'
import { readFileSync } from 'fs'

const BACKEND = 'http://localhost:3001/api/prove'
const CONTRACT = 'CCNEQQDFCCPBGESC7ORKUANKIFBEPGMU62VW3NOMEOTXID7KIRCGVGKY'

function arrToHex(arr) {
  return Buffer.from(arr).toString('hex')
}

async function main() {
  // Generate RWA proof (useCase=1)
  const res = await fetch(BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      useCase: 1,
      inputs: {
        age: 24, kyc_level: 2, investor_type: 1, max_investment: 500,
        restricted: 0,         credential_secret: '67890',
        required_age: 18, required_kyc: 2, required_investor_type: 0, investment_amount: 100,
      },
    }),
  })

  if (!res.ok) {
    console.error('Proof failed:', await res.text())
    process.exit(1)
  }

  const proof = await res.json()
  console.log('RWA proof generated')

  const args = [
    'contract', 'invoke',
    '--id', CONTRACT,
    '--source', 'zk_access_gate',
    '--network', 'testnet',
    '--',
    'verify',
    '--use_case', '1',
    '--pi_a', arrToHex(proof.pi_a),
    '--pi_b', arrToHex(proof.pi_b),
    '--pi_c', arrToHex(proof.pi_c),
    '--public_inputs', JSON.stringify(proof.publicInputs.map(arrToHex)),
  ]

  console.log('Invoking contract (RWA)...')
  const result = spawnSync('stellar', args, { encoding: 'utf8', timeout: 60000 })

  if (result.stdout) console.log('Contract result:', result.stdout)
  if (result.stderr) console.error('Details:', result.stderr)
  console.log('Exit code:', result.status)
}

main().catch(console.error)
