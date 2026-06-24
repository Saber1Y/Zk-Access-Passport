#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, BytesN, Env, Vec, vec};

use soroban_sdk::crypto::bn254::{Bn254G1Affine, Bn254G2Affine, Fr};

mod vk;

#[contracttype]
pub enum DataKey {
    Nullifier(BytesN<32>),
}

#[contract]
pub struct ZkAccessGate;

#[contractimpl]
impl ZkAccessGate {
    pub fn verify(
        env: Env,
        use_case: u32,
        pi_a: BytesN<64>,
        pi_b: BytesN<128>,
        pi_c: BytesN<64>,
        public_inputs: Vec<BytesN<32>>,
    ) -> Vec<BytesN<32>> {
        let n = public_inputs.len();
        if n == 0 {
            env.events().publish((symbol_short!("error"),), "no public inputs");
            panic!("at least one public input required (nullifier_hash)");
        }

        let nullifier = public_inputs.get(n - 1).unwrap();
        let key = DataKey::Nullifier(nullifier.clone());
        if env.storage().instance().has(&key) {
            env.events().publish((symbol_short!("error"),), "replay: nullifier already spent");
            panic!("replay: nullifier already spent");
        }

        let valid = match use_case {
            0 => Self::verify_remit_proof(&env, pi_a, pi_b, pi_c, &public_inputs),
            1 => Self::verify_rwa_proof(&env, pi_a, pi_b, pi_c, &public_inputs),
            _ => {
                env.events().publish((symbol_short!("error"),), "invalid use_case");
                panic!("invalid use_case: 0 = remit, 1 = rwa");
            }
        };
        if !valid {
            env.events().publish((symbol_short!("error"),), "proof verification failed");
            panic!("proof verification failed");
        }

        env.storage().instance().set(&key, &true);

        public_inputs
    }
}

impl ZkAccessGate {
    fn verify_remit_proof(
        env: &Env,
        pi_a: BytesN<64>,
        pi_b: BytesN<128>,
        pi_c: BytesN<64>,
        public_inputs: &Vec<BytesN<32>>,
    ) -> bool {
        let bn254 = env.crypto().bn254();

        let a = Bn254G1Affine::from_bytes(pi_a);
        let b = Bn254G2Affine::from_bytes(pi_b);
        let c = Bn254G1Affine::from_bytes(pi_c);
        let alpha = Bn254G1Affine::from_array(env, &vk::VK_ALPHA_G1);
        let beta = Bn254G2Affine::from_array(env, &vk::VK_BETA_G2);
        let gamma = Bn254G2Affine::from_array(env, &vk::VK_GAMMA_G2);
        let delta = Bn254G2Affine::from_array(env, &vk::REMIT_DELTA_G2);

        let mut vk_x = Bn254G1Affine::from_array(env, &vk::REMIT_IC[0]);
        for i in 0..public_inputs.len() {
            let scalar = Fr::from_bytes(public_inputs.get(i).unwrap());
            let ic = Bn254G1Affine::from_array(env, &vk::REMIT_IC[(i + 1) as usize]);
            vk_x = vk_x + ic * scalar;
        }

        let g1s = vec![env, -a, alpha, vk_x, c];
        let g2s = vec![env, b, beta, gamma, delta];
        bn254.pairing_check(g1s, g2s)
    }

    fn verify_rwa_proof(
        env: &Env,
        pi_a: BytesN<64>,
        pi_b: BytesN<128>,
        pi_c: BytesN<64>,
        public_inputs: &Vec<BytesN<32>>,
    ) -> bool {
        let bn254 = env.crypto().bn254();

        let a = Bn254G1Affine::from_bytes(pi_a);
        let b = Bn254G2Affine::from_bytes(pi_b);
        let c = Bn254G1Affine::from_bytes(pi_c);
        let alpha = Bn254G1Affine::from_array(env, &vk::VK_ALPHA_G1);
        let beta = Bn254G2Affine::from_array(env, &vk::VK_BETA_G2);
        let gamma = Bn254G2Affine::from_array(env, &vk::VK_GAMMA_G2);
        let delta = Bn254G2Affine::from_array(env, &vk::RWA_DELTA_G2);

        let mut vk_x = Bn254G1Affine::from_array(env, &vk::RWA_IC[0]);
        for i in 0..public_inputs.len() {
            let scalar = Fr::from_bytes(public_inputs.get(i).unwrap());
            let ic = Bn254G1Affine::from_array(env, &vk::RWA_IC[(i + 1) as usize]);
            vk_x = vk_x + ic * scalar;
        }

        let g1s = vec![env, -a, alpha, vk_x, c];
        let g2s = vec![env, b, beta, gamma, delta];
        bn254.pairing_check(g1s, g2s)
    }
}
