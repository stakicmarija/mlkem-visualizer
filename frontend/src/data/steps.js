// Step tree data for KeyGen, Encaps, Decaps -- consumed by <StepTree>.
// This is UI/navigation structure, separate from the cryptographic values
// in mlkem_768_data.json.
//
// Shape of each step:
//   id           unique string, used to match against currentStepIndex
//   label        display text
//   level        indentation depth (0 = top, 1 = Internal, 2 = K-PKE)
//   isGroupLabel true for section headers ("Internal", "K-PKE") -- bold
//                text, dotted connector down to children, no circle/state
//   isFinal      true for a step visually separated (extra spacing above)
//                from the main tree, e.g. the outer "Return" step
//
// currentStepIndex refers to the index within the FILTERED list of
// non-group steps (isGroupLabel: false) -- group labels are structural,
// they don't get a pending/active/done state of their own.

export const keygenSteps = [
  { id: 'ml-kem', label: 'ML-KEM', level: 0, isGroupLabel: true },
  { id: 'check-inputs', label: 'Check inputs', level: 0 },
  { id: 'run-internal', label: 'Run internal algorithm', level: 0 },
  { id: 'internal', label: 'Internal', level: 1, isGroupLabel: true },
  { id: 'generate-pke-pair', label: 'Generate PKE key pair', level: 1 },
  { id: 'kpke', label: 'K-PKE', level: 2, isGroupLabel: true },
  { id: 'derive-rho-sigma', label: 'Derive ρ and σ', level: 2 },
  { id: 'expand-matrix-a', label: 'Expand matrix A', level: 2 },
  { id: 'generate-secret-vector', label: 'Generate secret vector', level: 2 },
  { id: 'generate-error-vector', label: 'Generate error vector', level: 2 },
  { id: 'transform-ntt', label: 'Transform to NTT domain', level: 2 },
  { id: 'compute-t', label: 'Compute public key t', level: 2 },
  { id: 'pack-keys', label: 'Pack keys', level: 2 },
  { id: 'build-dk', label: 'Build decapsulation key', level: 1 },
  { id: 'return-ek-dk', label: 'Return (ek, dk)', level: 0, isFinal: true },
];

export const encapsSteps = [
  { id: 'ml-kem', label: 'ML-KEM', level: 0, isGroupLabel: true },
  { id: 'generate-m', label: 'Generate m', level: 0 },
  { id: 'run-internal', label: 'Run internal algorithm', level: 0 },
  { id: 'internal', label: 'Internal', level: 1, isGroupLabel: true },
  { id: 'derive-k-r', label: 'Derive (K, r)', level: 1 },
  { id: 'encrypt-m', label: 'Encrypt m using PKE', level: 1 },
  { id: 'kpke', label: 'K-PKE', level: 2, isGroupLabel: true },
  { id: 'decode-public-key', label: 'Decode public key', level: 2 },
  { id: 'regenerate-matrix-a', label: 'Regenerate matrix A', level: 2 },
  { id: 'generate-ephemeral-y', label: 'Generate ephemeral secret y', level: 2 },
  { id: 'generate-error-vectors', label: 'Generate error vectors e₁, e₂', level: 2 },
  { id: 'transform-ntt', label: 'Transform to NTT domain', level: 2 },
  { id: 'compute-u', label: 'Compute u', level: 2 },
  { id: 'encode-plaintext', label: 'Encode plaintext m', level: 2 },
  { id: 'compute-v', label: 'Compute v', level: 2 },
  { id: 'compress-pack', label: 'Compress & pack ciphertext', level: 2 },
  { id: 'return-kc-inner', label: 'Return (K, c)', level: 1 },
  { id: 'return-kc', label: 'Return (K, c)', level: 0, isFinal: true },
];

export const decapsSteps = [
  { id: 'run-internal', label: 'Run internal algorithm', level: 0 },
  { id: 'internal', label: 'Internal', level: 1, isGroupLabel: true },
  { id: 'extract-data', label: 'Extract data', level: 1 },
  { id: 'decrypt-ciphertext', label: 'Decrypt ciphertext', level: 1 },
  { id: 'kpke', label: 'K-PKE', level: 2, isGroupLabel: true },
  { id: 'extract-c1-c2', label: 'Extract c1, c2', level: 2 },
  { id: 'decode-ciphertext', label: 'Decode ciphertext', level: 2 },
  { id: 'decode-secret-key', label: 'Decode secret key', level: 2 },
  { id: 'compute-message-poly', label: 'Compute message polynomial w', level: 2 },
  { id: 'recover-plaintext', label: 'Recover plaintext m', level: 2 },
  { id: 'return-plaintext', label: 'Return plaintext', level: 2 },
  { id: 'derive-kprime-rprime', label: "Derive (K', r')", level: 1 },
  { id: 'derive-ktilde', label: 'Derive K̃', level: 1 },
  { id: 're-encrypt', label: 'Re-encrypt', level: 1 },
  { id: 'kpke-2', label: 'K-PKE', level: 2, isGroupLabel: true },
  { id: 'return-cprime', label: "Return c'", level: 2 },
  { id: 'compare-c', label: "Compare c and c'", level: 1 },
  { id: 'return-kprime-inner', label: "Return K'", level: 1 },
  { id: 'return-kprime', label: "Return K'", level: 0, isFinal: true },
];