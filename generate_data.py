"""
Generates a single JSON file containing every intermediate value of an
ML-KEM-768 (FIPS 203) run (KeyGen, Encapsulation, and Decapsulation)
for use in a front-end visualization.

Uses kyber-py (pure Python FIPS 203 implementation) and manually replays
each internal algorithm step so every intermediate value can be captured,
not just the final public API outputs.

"""

import json
import os
from kyber_py.ml_kem import ML_KEM_768

Q = 3329
N_COEFFS = 256
K = 3
ETA1 = 2
ETA2 = 2
DU = 10
DV = 4

# ---------------------------------------------------------------------------
# Fixed seeds (deterministic run, same values every time this script runs,
# so the app and the thesis always describe the exact same numbers)
# ---------------------------------------------------------------------------
D_HEX = "8a65ae579e08bb080bc2df7db539bec3e2e7fa60971252477a67629a3907b35b"
Z_HEX = "c84b137a585711a04ff6577ff10a6c69587f6d41c96db0e5e9c3f7fe1c030600"

# Fixed "random" inputs for encapsulation (normally os.urandom(32))
M_HEX = "5f2a819c3d7e401bf6c8a29d0e7b3c5108f4e9a6d2b1c7038e5f0a9d4b2c1e88"

D = bytes.fromhex(D_HEX)
Z = bytes.fromhex(Z_HEX)
M = bytes.fromhex(M_HEX)


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def to_signed(coeffs, q=Q):
    """Convert canonical [0, q-1] coefficients to signed [-q/2, q/2] form.
    Used for CBD-sampled ("small") values: s, e, y, e1, e2."""
    half = q // 2
    return [c if c <= half else c - q for c in coeffs]


def poly_dict(poly, signed=False):
    """Serialize a single polynomial (256 coefficients)."""
    coeffs_modq = list(poly.coeffs)
    d = {"coeffs": coeffs_modq}
    if signed:
        d["coeffs_signed"] = to_signed(coeffs_modq)
    return d


def vector_dict(vec, k, signed=False):
    """Serialize a Vector (k polynomials). Uses the library's own __getitem__
    (vec[i, 0]) rather than raw ._data access, since the internal transpose
    flag differs depending on whether the vector came from M.vector() or
    from a matmul/add result."""
    return [poly_dict(vec[i, 0], signed=signed) for i in range(k)]


def matrix_dict(mat, k, signed=False):
    """Serialize a Matrix (k x k polynomials) via mat[i, j]."""
    return [
        [poly_dict(mat[i, j], signed=signed) for j in range(k)] for i in range(k)
    ]


def to_hex(b: bytes) -> str:
    return b.hex()


# ---------------------------------------------------------------------------
# set up
# ---------------------------------------------------------------------------
kem = ML_KEM_768
data = {}

data["params"] = {
    "name": "ML-KEM-768",
    "k": K,
    "q": Q,
    "n": N_COEFFS,
    "eta1": ETA1,
    "eta2": ETA2,
    "du": DU,
    "dv": DV,
    "ek_size_bytes": 384 * K + 32,
    "dk_size_bytes": 768 * K + 96,
    "ciphertext_size_bytes": 32 * (DU * K + DV),
    "shared_secret_size_bytes": 32,
    "nist_security_category": 3,
}

data["inputs"] = {
    "d": to_hex(D),
    "z": to_hex(Z),
    "m": to_hex(M),
}

# ===========================================================================
# KEYGEN  (Alice) - Algorithm 13 (K-PKE.KeyGen) + Algorithm 16 (internal)
#                     + Algorithm 19 (ML-KEM.KeyGen)
# ===========================================================================
keygen = {}

# --- Derive rho, sigma -----------------------------------------------------
rho, sigma = kem._G(D + bytes([kem.k]))
keygen["rho"] = to_hex(rho)
keygen["sigma"] = to_hex(sigma)

# --- Expand matrix A ---------------------------------------------------
A_hat = kem._generate_matrix_from_seed(rho)
keygen["A"] = matrix_dict(A_hat, K)

# --- Generate secret vector s and error vector e (with raw PRF bytes) -----
N = 0
s_elements = []
s_prf_raw = []
for i in range(K):
    prf_output = kem._prf(ETA1, sigma, bytes([N]))
    s_prf_raw.append(to_hex(prf_output))
    s_elements.append(kem.R.cbd(prf_output, ETA1))
    N += 1
s_vec = kem.M.vector(s_elements)

e_elements = []
e_prf_raw = []
for i in range(K):
    prf_output = kem._prf(ETA1, sigma, bytes([N]))
    e_prf_raw.append(to_hex(prf_output))
    e_elements.append(kem.R.cbd(prf_output, ETA1))
    N += 1
e_vec = kem.M.vector(e_elements)

keygen["s"] = vector_dict(s_vec, K, signed=True)
keygen["s_prf_raw"] = s_prf_raw
keygen["e"] = vector_dict(e_vec, K, signed=True)
keygen["e_prf_raw"] = e_prf_raw

# --- Transform to NTT domain -----------------------------------------------
s_hat = s_vec.to_ntt()
e_hat = e_vec.to_ntt()
keygen["s_ntt"] = vector_dict(s_hat, K)
keygen["e_ntt"] = vector_dict(e_hat, K)

# --- Compute public key t ---------------------------------------------
t_hat = A_hat @ s_hat + e_hat
keygen["t"] = vector_dict(t_hat, K)

# --- Pack keys ---------------------------------------------------------
ek_pke = t_hat.encode(12) + rho
dk_pke = s_hat.encode(12)

# --- Build decapsulation key (Algorithm 16) --------------------------------
ek = ek_pke
H_ek = kem._H(ek)
dk = dk_pke + ek + H_ek + Z

keygen["ek_pke"] = to_hex(ek_pke)
keygen["dk_pke"] = to_hex(dk_pke)
keygen["H_ek"] = to_hex(H_ek)
keygen["ek"] = to_hex(ek)
keygen["dk"] = to_hex(dk)

data["keygen"] = keygen

# ===========================================================================
# ENCAPSULATION  (Bob) - Algorithm 14 (K-PKE.Encrypt)
#                          + Algorithm 17 (internal) + Algorithm 20 (ML-KEM.Encaps)
# ===========================================================================
encaps = {}

# --- Derive (K, r) from m and H(ek) ----------------------------------------
K_shared, r = kem._G(M + H_ek)
encaps["K"] = to_hex(K_shared)
encaps["r"] = to_hex(r)

# --- Decode public key (Bob's view of Alice's ek) ---------------------
t_hat_bob = kem.M.decode_vector(ek[:-32], K, 12, is_ntt=True)
rho_bob = ek[-32:]
encaps["decoded_rho"] = to_hex(rho_bob)

# --- Regenerate matrix A^T ----------------------------------------------
A_hat_T = kem._generate_matrix_from_seed(rho_bob, transpose=True)
encaps["A_T"] = matrix_dict(A_hat_T, K)

# --- Generate ephemeral secret y, error vectors e1, e2 (with raw PRF) -----
N = 0
y_elements = []
y_prf_raw = []
for i in range(K):
    prf_output = kem._prf(ETA1, r, bytes([N]))
    y_prf_raw.append(to_hex(prf_output))
    y_elements.append(kem.R.cbd(prf_output, ETA1))
    N += 1
y_vec = kem.M.vector(y_elements)

e1_elements = []
e1_prf_raw = []
for i in range(K):
    prf_output = kem._prf(ETA2, r, bytes([N]))
    e1_prf_raw.append(to_hex(prf_output))
    e1_elements.append(kem.R.cbd(prf_output, ETA2))
    N += 1
e1_vec = kem.M.vector(e1_elements)

e2_prf_output = kem._prf(ETA2, r, bytes([N]))
e2_poly = kem.R.cbd(e2_prf_output, ETA2)
N += 1

encaps["y"] = vector_dict(y_vec, K, signed=True)
encaps["y_prf_raw"] = y_prf_raw
encaps["e1"] = vector_dict(e1_vec, K, signed=True)
encaps["e1_prf_raw"] = e1_prf_raw
encaps["e2"] = poly_dict(e2_poly, signed=True)
encaps["e2_prf_raw"] = to_hex(e2_prf_output)

# --- Transform y to NTT domain ----------------------------------------
y_hat = y_vec.to_ntt()
encaps["y_ntt"] = vector_dict(y_hat, K)

# --- Compute u = A^T y + e1 ---------------------------------------------
u = (A_hat_T @ y_hat).from_ntt() + e1_vec
encaps["u"] = vector_dict(u, K)

# --- Encode plaintext m as mu (the ZQ-circle step) -------------------------
mu = kem.R.decode(M, 1).decompress(1)
encaps["mu"] = poly_dict(mu)
encaps["m_bits"] = to_hex(M)  # raw message bytes, for the bit-encoding visual

# --- Compute v = t^T y + e2 + mu ----------------------------------------
v = t_hat_bob.dot(y_hat).from_ntt() + e2_poly + mu
encaps["v"] = poly_dict(v)

# --- Compress & pack ciphertext ------------------------------------------
u_compressed = u.compress(DU)
v_compressed = v.compress(DV)
c1 = u_compressed.encode(DU)
c2 = v_compressed.encode(DV)
c = c1 + c2

encaps["u_compressed"] = vector_dict(u_compressed, K)
encaps["v_compressed"] = poly_dict(v_compressed)
encaps["c1"] = to_hex(c1)
encaps["c2"] = to_hex(c2)
encaps["c"] = to_hex(c)

data["encaps"] = encaps

# ===========================================================================
# DECAPSULATION  (Alice) - Algorithm 15 (K-PKE.Decrypt)
#                            + Algorithm 18 (internal) + Algorithm 21 (ML-KEM.Decaps)
# ===========================================================================
decaps = {}

# --- Extract data from dk -----------------------------------------------
dk_pke_d = dk[0 : 384 * K]
ek_pke_d = dk[384 * K : 768 * K + 32]
h_d = dk[768 * K + 32 : 768 * K + 64]
z_d = dk[768 * K + 64 :]

decaps["dk_pke"] = to_hex(dk_pke_d)
decaps["ek_pke"] = to_hex(ek_pke_d)
decaps["h"] = to_hex(h_d)
decaps["z"] = to_hex(z_d)

# --- Decrypt ciphertext (K-PKE.Decrypt) ------------------------------------
n_split = K * DU * 32
c1_bytes, c2_bytes = c[:n_split], c[n_split:]

u_dec = kem.M.decode_vector(c1_bytes, K, DU).decompress(DU)
v_dec = kem.R.decode(c2_bytes, DV).decompress(DV)
s_hat_dec = kem.M.decode_vector(dk_pke_d, K, 12, is_ntt=True)

decaps["u_decoded"] = vector_dict(u_dec, K)
decaps["v_decoded"] = poly_dict(v_dec)

u_hat_dec = u_dec.to_ntt()
decaps["u_decoded_ntt"] = vector_dict(u_hat_dec, K)
w = v_dec - (s_hat_dec.dot(u_hat_dec)).from_ntt()
decaps["w"] = poly_dict(w)

# --- Compress1(w) -> recovered message bits --------------------------------
w_compressed = w.compress(1)
m_prime = w_compressed.encode(1)
decaps["w_compressed"] = poly_dict(w_compressed)
decaps["m_prime"] = to_hex(m_prime)

# --- Derive (K', r') and K-tilde --------------------------------------
K_prime, r_prime = kem._G(m_prime + h_d)
K_tilde = kem._J(z_d + c)
decaps["K_prime"] = to_hex(K_prime)
decaps["r_prime"] = to_hex(r_prime)
decaps["K_tilde"] = to_hex(K_tilde)

# --- Re-encrypt (K-PKE.Encrypt again, with m' and r') ----------------------
c_prime = kem._k_pke_encrypt(ek_pke_d, m_prime, r_prime)
decaps["c_prime"] = to_hex(c_prime)

# --- Compare c and c' -> final result (success case: they match) ----------
match = c == c_prime
decaps["match"] = match
decaps["K_final"] = to_hex(K_prime if match else K_tilde)

data["decaps"] = decaps

# ---------------------------------------------------------------------------
# write out
# ---------------------------------------------------------------------------
out_path = "mlkem_768_data.json"
with open(out_path, "w") as f:
    json.dump(data, f, indent=2)

size_kb = os.path.getsize(out_path) / 1024
print(f"Wrote {out_path} ({size_kb:.1f} KB)")
