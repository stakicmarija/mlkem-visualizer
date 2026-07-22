// Popup explanation text for every value and transform shown across the
// app - separate from mlkem_768_data.json (which holds the actual
// cryptographic values) and steps.js (which holds step-tree structure).
//
// Each entry: { title, body }
//   title  shown at the top of the Popup (bold, .formula class)
//   body   the explanation paragraph(s), plain text
//
// The actual VALUE shown in the popup's optional gray box comes from
// mlkem_768_data.json at render time - this file only holds the fixed
// explanatory text, which doesn't change between runs.
//
// Keys match the symbol used in the UI (ρ -> 'rho', σ -> 'sigma', etc.)
// so a component can do explanations[symbolKey] to look up its text.

export const explanations = {
  // ---- KeyGen inputs / seeds ----------------------------------------
  d: {
    title: 'd (32-byte seed)',
    body: 'The single random seed for key generation. All other secret values (ρ, σ, s, e) are derived from it.',
  },
  z: {
    title: 'z (32-byte seed)',
    body: 'A random seed used only in decapsulation. If a ciphertext fails verification, ML-KEM returns a fake shared secret derived from z instead of signaling an error (implicit rejection)'
    },
  rho: {
    title: 'ρ (32-byte value)',
    body: 'A public seed derived from d, used to expand the public matrix A. Since ρ is public, anyone can reconstruct the same matrix A from it.',
  },
  sigma: {
    title: 'σ (32-byte value)',
    body: "A secret seed derived from d, used to sample the secret vector s and the error vector e. Unlike ρ, σ must stay private, as it determines Alice's secret key.",
  },

  // ---- KeyGen transforms ----------------------------------------------
  G: {
    title: 'G (hash function)',
    body: 'A SHA3-512 hash that takes d and outputs 64 bytes, split into ρ (first 32 bytes) and σ (last 32 bytes). The same input always produces the same output, so key generation is fully deterministic.',
  },
  H: {
    title: 'H (hash function)',
    body: 'A hash function based on SHA3-256, used to hash the encapsulation key (H(ek)). This hash is bundled into the decapsulation key and later used when deriving the shared secret, binding it to the specific public key used.',
  },
  J: {
    title: 'J (hash function)',
    body: 'A hash function based on SHAKE256, used only during decapsulation to derive K̃, the fallback shared secret returned when ciphertext verification fails (implicit rejection).',
  },
  PRF: {
    title: 'PRF (pseudorandom function)',
    body: 'A pseudorandom function based on SHAKE256. It takes a 32-byte seed and a 1-byte counter N, and stretches them into 64·η bytes of pseudorandom output. These bytes feed into SamplePolyCBD to sample one small polynomial. The counter N changes on each call, so the same seed produces a different polynomial each time.',
  },
  N: {
    title: 'N (counter)',
    body: 'A counter that increments with each call to PRF. Combined with the same seed, it ensures every sampled polynomial is different.',
  },
  SampleNTT: {
    title: 'SampleNTT',
    body: 'A function based on an extendable-output function (XOF/SHAKE128). For each pair of indices (i, j), it takes ρ‖j‖i and deterministically generates one polynomial A[i][j] with 256 coefficients, each reduced mod q = 3329, directly in the NTT domain. Deterministic, the same ρ always yields the same matrix A.',
  },
  SamplePolyCBD: {
    title: 'SamplePolyCBD',
    body: 'Samples a small polynomial from a centered binomial distribution. It reads the PRF output 2η bits at a time, counts the 1-bits in each half (x and y), and sets each coefficient to x − y. This concentrates coefficients near zero, which is what makes the resulting vector "small" and gives the Learning With Errors problem its hardness.',
  },
  NTT: {
    title: 'NTT (Number-Theoretic Transform)',
    body: 'Transforms a polynomial into an alternative representation where polynomial multiplication becomes simple pointwise multiplication, making matrix operations much faster in later steps. The polynomial itself is unchanged, only its representation differs. NTT is the finite-field analogue of the Fast Fourier Transform (FFT).',
  },
  NTT_inverse: {
    title: 'NTT⁻¹ (Inverse NTT)',
    body: 'The inverse of NTT: converts a polynomial back from the NTT domain into ordinary coefficient form. Used after a pointwise (NTT-domain) multiplication, so the result can be combined with coefficient-form values like the error vector e1.',
  },
  ByteEncode: {
    title: 'ByteEncode₁₂',
    body: 'Packs a polynomial\'s 256 coefficients into a compact byte string, using 12 bits per coefficient (enough to represent any value mod q = 3329 exactly). This is how polynomials become the actual bytes stored in ek and dk.',
  },
  ByteDecode: {
    title: 'ByteDecode₁₂',
    body: 'The inverse of ByteEncode₁₂: unpacks a byte string 12 bits at a time back into a polynomial\'s 256 coefficients mod q = 3329. This is how Bob recovers Alice\'s public polynomial t̂ from the raw bytes of ek.',
  },
  ByteDecode1: {
    title: 'ByteDecode₁',
    body: 'The d=1 case of ByteDecode: unpacks the 32-byte message m into 256 individual bits, one per coefficient position. Each "coefficient" is just a single 0 or 1 before Decompress spreads it across the mod-q range.',
  },
  Decompress: {
    title: 'Decompress',
    body: 'Maps a d-bit compressed value back onto the full mod-q range, spacing the 2^d possible values as evenly as possible around the ring. For d=1 (one message bit), 0 maps to 0 and 1 maps to ⌈q/2⌋ = 1665. As far apart as two points on the ring can be, which is what makes the encoded bit resistant to noise.',
  },
  Compress: {
    title: 'Compress',
    body: 'The reverse of Decompress: maps a mod-q coefficient down to a much smaller d-bit range (0 to 2^d − 1). This throws away precision, but only as much as the noise already added earlier can absorb, so Decompress can still recover a value close enough to the original for decryption to work.',
  },
  ByteEncodeD: {
    title: 'ByteEncode',
    body: 'Packs a polynomial\'s 256 already-compressed coefficients into a byte string, using exactly d bits per coefficient instead of the full 12 -- this is what actually shrinks the ciphertext down to a fixed, compact size.',
  },
  ByteDecodeD: {
    title: 'ByteDecode',
    body: 'The inverse of ByteEncode: unpacks a byte string back into a polynomial\'s coefficients, using exactly d bits per coefficient -- the same d used to compress it. This recovers the still-compressed (0 to 2^d − 1) values, not yet the full mod-q range; Decompress does that next.',
  },

  // ---- KeyGen values ----------------------------------------------------
  A: {
    title: 'A (matrix)',
    body: 'A k×k matrix of polynomials in Rq, generated entirely from the public seed ρ. Each entry has 256 coefficients, uniformly random mod q = 3329. Because A is public and uniformly random, its structure hides nothing, the security of ML-KEM comes from combining A with a small secret, not from A itself.',
  },
  s: {
    title: 's (secret vector)',
    body: "Alice's secret key material. A vector of k small polynomials, each coefficient sampled from a centered binomial distribution (typically -2 to 2). s must never be shared; it is what lets Alice (and only Alice) recover the shared secret later.",
  },
  e: {
    title: 'e (error vector)',
    body: 'A vector of k small polynomials, sampled the same way as s. Added to A·s when computing the public key t, e is what makes recovering s from t computationally hard, the noise "hides" the secret inside a value that otherwise looks uniformly random.',
  },
  t: {
    title: 't (public key)',
    body: "Alice's public key: t = A·s + e. Combines the public matrix A, the secret s, and the small noise e. Because e hides s, recovering s from t is the Learning With Errors (LWE) problem, believed to be hard even for quantum computers, and the basis of ML-KEM's security.",
  },
  ekPke: {
    title: 'ekpke (K-PKE encapsulation key)',
    body: 'The byte encoding of t and ρ: ByteEncode₁₂(t)‖ρ. This is the underlying public-key material produced by K-PKE. The final ek is set directly equal to this value, with nothing added.',
  },
  dkPke: {
    title: 'dkpke (K-PKE decapsulation key)',
    body: 'The byte encoding of s: ByteEncode₁₂(s). This is the underlying private-key material produced by K-PKE. The final dk wraps this together with a copy of ek, a hash of ek, and the seed z, built in the next step.',
  },
  ek: {
    title: 'ek (encapsulation key)',
    body: "Alice's public key, sent to Bob. Contains the encoded polynomial t and the seed ρ, packed into a single byte string. Anyone can use ek to encapsulate a shared secret for Alice, but only Alice can decapsulate it.",
  },
  dk: {
    title: 'dk (decapsulation key)',
    body: "Alice's private key, kept secret. Bundles four things: the encoded secret vector s, a copy of ek, a hash of ek, and the seed z. Everything Alice needs to decapsulate a ciphertext later is packed into this one value.",
  },

  // ---- Decaps ------------------------------------------------------------
  dkPKE: {
    title: 'dkPKE (private key material)',
    body: "The first 384k bytes of dk -- Alice's encoded PKE secret vector s, the same value packed into dk back during key generation. Used to decrypt the ciphertext during decapsulation.",
  },
  ekPKE: {
    title: 'ekPKE (public key material)',
    body: "A copy of Alice's encapsulation key, bundled inside dk so decapsulation can re-encrypt and check the ciphertext without ek needing to be supplied separately.",
  },
  h: {
    title: 'h = H(ek)',
    body: "A stored hash of Alice's encapsulation key, computed once during key generation and bundled into dk. Re-used during decapsulation to derive K, without re-hashing ek from scratch.",
  },

  // ---- Encaps ----------------------------------------------------------
  m: {
    title: 'm (message)',
    body: 'A random 32-byte value generated by Bob. This is not the shared secret itself, it is encoded bit by bit into a polynomial (μ) and hidden inside the ciphertext, then recovered by Alice during decapsulation to derive the shared secret K.',
  },
  r: {
    title: 'r (randomness)',
    body: 'Derived from m together with H(ek), r seeds every pseudorandom value generated during encapsulation (y, e1, e2). Because r is derived deterministically from m, the entire encapsulation process is reproducible given the same m, which is exactly what makes the re-encryption check during decapsulation possible.',
  },
  y: {
    title: 'y (ephemeral secret)',
    body: "Bob's one-time secret vector, sampled the same way as Alice's s during key generation. Used together with the regenerated matrix A to compute u, and with Alice's public key t to compute v. Discarded after this single encapsulation, never reused.",
  },
  e1: {
    title: 'e1 (error vector)',
    body: 'A vector of k small polynomials, sampled via CBD like e in key generation. Added when computing u = Aᵀy + e1, hiding y the same way e hides s in the public key.',
  },
  e2: {
    title: 'e2 (error polynomial)',
    body: 'A single small polynomial (not a vector, unlike e1), sampled the same way. Added when computing v = tᵀy + e2 + μ, contributing noise that hides the encoded message μ.',
  },
  mu: {
    title: 'μ (encoded message)',
    body: 'The message m, decoded bit by bit and mapped onto the ring Rq. Each bit becomes either 0 or q/2, placing it at one of two points on a mod-q "circle." This is what gets buried in noise when computing v, then recovered (approximately) by Alice during decapsulation.',
  },
  u: {
    title: 'u (ciphertext part 1)',
    body: 'Computed as u = Aᵀy + e1. Together with v, forms the ciphertext c sent to Alice. u lets Alice reconstruct enough information to cancel out the shared A·s·y term when decrypting, without ever learning y or s directly from it.',
  },
  Aty: {
    title: 'Aᵀy (intermediate value)',
    body: 'The result of NTT⁻¹(Aᵀ ∘ ŷ), back in ordinary coefficient form. Not a named object with its own identity in ML-KEM, just the mid-point of computing u, e1 is added to it next to produce the final ciphertext part u.',
  },
  tTy: {
    title: 't̂ᵀy (intermediate value)',
    body: 'The result of NTT⁻¹(t̂ᵀ ∘ ŷ), back in ordinary coefficient form. Not a named object with its own identity in ML-KEM, just the mid-point of computing v, e2 and μ are added to it next to produce the final ciphertext part v.',
  },
  v: {
    title: 'v (ciphertext part 2)',
    body: 'Computed as v = tᵀy + e2 + μ. Carries the encoded message μ, hidden under noise. Alice recovers μ (and therefore m) by computing v − sᵀu, which cancels the shared term and leaves only μ plus a small, correctable error.',
  },
  c1: {
    title: 'c1 (ciphertext part 1)',
    body: 'u, compressed to du bits per coefficient and packed into bytes via ByteEncode. The larger of the two ciphertext parts, since u is a vector of k polynomials rather than a single one.',
  },
  c2: {
    title: 'c2 (ciphertext part 2)',
    body: 'v, compressed to dv bits per coefficient and packed into bytes via ByteEncode - the same way as c1, just on a single polynomial instead of a vector.',
  },
  c: {
    title: 'c (ciphertext)',
    body: 'The compressed, packed combination of u and v, sent from Bob to Alice. This is the only value that travels over the network during encapsulation, everything an eavesdropper could see.',
  },
  K: {
    title: 'K (shared secret)',
    body: "The value both Alice and Bob end up holding after encapsulation/decapsulation complete successfully, derived from m and H(ek), never sent directly over the network. This is what the whole KEM exchange exists to produce, typically used afterward as a symmetric encryption key.",
  },

  // ---- Decaps ------------------------------------------------------------
  uPrime: {
    title: "u' (decoded ciphertext part 1)",
    body: 'u, recovered by decoding c1 -- the reverse of the Compress + ByteEncode Bob used to produce c1. Not exactly equal to the u Bob originally computed (compression is lossy), but close enough for decryption to still work.',
  },
  vPrime: {
    title: "v' (decoded ciphertext part 2)",
    body: "v, recovered by decoding c2 the same way. Together with u', lets Alice reconstruct w = v' − sᵀu', recovering the encoded message μ (approximately) hidden inside.",
  },
  sTuPrime: {
    title: "ŝᵀu' (intermediate value)",
    body: "The result of NTT⁻¹(ŝᵀ ∘ NTT(u')), back in ordinary coefficient form. Not a named object with its own identity in ML-KEM, just the mid-point of recovering w -- subtracted from v' next to produce the recovered message polynomial w.",
  },
  w: {
    title: 'w (recovered polynomial)',
    body: 'Computed as w = v − sᵀu during decryption. Should equal μ plus a small error term, small enough that rounding recovers the original bit values correctly almost always.',
  },
  mPrime: {
    title: "m' (recovered message)",
    body: "The message bits recovered from w by rounding each coefficient to the nearer of 0 or q/2. If everything worked correctly, m' equals Bob's original m exactly.",
  },
  KPrime: {
    title: "K' (derived shared secret)",
    body: "Derived from m' and h (the stored hash of ek), the same way Bob derived K from m and H(ek). If m' matches Bob's original m, K' will equal Bob's K exactly. This is the shared secret both parties now hold.",
  },
  rPrime: {
    title: "r' (re-derived randomness)",
    body: "Derived from m' the same way Bob derived r from m. Used to re-run encryption and check that it reproduces the ciphertext Alice actually received.",
  },
  KTilde: {
    title: 'K̃ (fallback secret)',
    body: 'A pseudorandom value derived from z (Alice\'s private rejection seed) and the received ciphertext c. Returned as the "shared secret" instead of K\' whenever the re-encryption check fails, so an attacker sending a tampered ciphertext gets back a plausible-looking but useless key, with no visible error to signal that anything went wrong.',
  },
  cPrime: {
    title: "c' (re-encrypted ciphertext)",
    body: "Alice re-runs encryption using the recovered m' and r', producing c'. If decapsulation is working on a genuine, untampered ciphertext, c' will exactly equal the c Bob originally sent.",
  },
  KFinal: {
    title: 'K (shared secret)',
    body: "The value decapsulation actually returns -- K' if the re-encryption check passed (c' matches c), or the fallback K̃ if it didn't (implicit rejection). Alice never learns which case occurred; both paths return a value that looks equally valid, so a tampered ciphertext gets no visible error. When everything worked, this equals Bob's K exactly.",
  },

  //  Parameters (used by the "Learn about parameters" button) 

  parameters: [
    {
      label: 'q = 3329',
      body: 'Prime modulus used for all polynomial arithmetic. Every coefficient is computed modulo q.',
    },
    {
      label: 'n = 256',
      body: 'Each polynomial contains n coefficients.',
    },
    {
      label: 'k = 3',
      body: 'Defines the size of the matrix and vectors.',
    },
    {
      label: 'η1 = 2',
      body: 'Controls the CBD distribution used to generate the secret vector s and the error vector e during key generation.',
    },
    {
      label: 'η2 = 2',
      body: 'Controls the CBD distribution used to generate the encryption error vectors e1 and e2 during encapsulation.',
    },
    {
      label: 'du = 10',
      body: 'Determines how many bits are retained when compressing ciphertext component u.',
    },
    {
      label: 'dv = 4',
      body: 'Determines how many bits are retained when compressing ciphertext component v.',
    },
  ],
};