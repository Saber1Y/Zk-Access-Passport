// Test: generate proof + invoke Soroban contract
// Usage: node scripts/test_contract.js

import { spawnSync } from 'child_process'

const BACKEND = 'http://localhost:3001/api/prove'
const CONTRACT = 'CBDVEJZHVL63X4IY36NUURN6NBNVUYOLR6CR6HLOYWD5QJBGWIBMPNCM'

function arrToHex(arr) {
  return Buffer.from(arr).toString('hex')
}

async function main() {
  const res = await fetch(BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      useCase: 0,
      inputs: {
        age: 24, kyc_level: 2, already_sent: 300, monthly_limit: 1000,
        credential_secret: '12345', required_age: 18, required_kyc: 2, amount: 150,
      },
    }),
  })

  if (!res.ok) {
    console.error('Proof generation failed:', await res.text())
    process.exit(1)
  }

  const proof = await res.json()
  console.log('Proof generated successfully')

  const args = [
    'contract', 'invoke',
    '--id', CONTRACT,
    '--source', 'zk_access_gate',
    '--network', 'testnet',
    '--',
    'verify',
    '--use_case', '0',
    '--pi_a', arrToHex(proof.pi_a),
    '--pi_b', arrToHex(proof.pi_b),
    '--pi_c', arrToHex(proof.pi_c),
  ]

  const pubHex = JSON.stringify(proof.publicInputs.map(arrToHex))
  args.push('--public_inputs', pubHex)

  console.log('Invoking contract...')
  console.log('Args:', args.slice(0, 8).join(' ') + ' ...')

  const result = spawnSync('stellar', args, {
    encoding: 'utf8',
    timeout: 60000,
  })

  if (result.stdout) console.log('stdout:', result.stdout)
  if (result.stderr) console.error('stderr:', result.stderr)
  if (result.error) console.error('error:', result.error.message)

  console.log('Exit code:', result.status)
}

main().catch(console.error)
