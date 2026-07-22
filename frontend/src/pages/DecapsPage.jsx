import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import ExtractDataStep from '../steps/decaps/ExtractDataStep.jsx'
import ExtractC1C2Step from '../steps/decaps/ExtractC1C2Step.jsx'
import DecodeCiphertextStep from '../steps/decaps/DecodeCiphertextStep.jsx'
import DecodeSecretKeyStep from '../steps/decaps/DecodeSecretKeyStep.jsx'
import ComputeWStep from '../steps/decaps/ComputeWStep.jsx'
import RecoverPlaintextStep from '../steps/decaps/RecoverPlaintextStep.jsx'
import DeriveKprimeRprimeStep from '../steps/decaps/DeriveKprimeRprimeStep.jsx'
import DeriveKtildeStep from '../steps/decaps/DeriveKtildeStep.jsx'
import ReturnCPrimeStep from '../steps/decaps/ReturnCPrimeStep.jsx'
import CompareCStep from '../steps/decaps/CompareCStep.jsx'
import ReturnKprimeStep from '../steps/decaps/ReturnKprimeStep.jsx'
import { decapsSteps } from '../data/steps.js'
import { explanations } from '../data/explanations.js'
import { toSpacedHex, truncateHex } from '../utils/hex.js'
import { useStepNavigation } from '../utils/useStepNavigation.js'
import data from '../data/mlkem_768_data.json'

const navSteps = decapsSteps.filter(s => !s.isGroupLabel)

// Mirrors KeyGenPage/EncapsPage's TRANSITION_IDS: steps that only delegate,
// with no content of their own -- 'decrypt-ciphertext' fans straight into
// K-PKE the same way Encaps' 'encrypt-m' does. 'return-plaintext' likewise
// just hands m back up to the outer algorithm, no content of its own.
// 're-encrypt' is the same shape as 'decrypt-ciphertext' -- a level-1
// parent step introducing its own K-PKE sub-group, no content of its own.
// 'return-kprime-inner' likewise just hands K' back up to the outer
// algorithm before the final 'return-kprime' step displays it.
const TRANSITION_IDS = new Set([
  'run-internal', 'decrypt-ciphertext', 'return-plaintext', 're-encrypt', 'return-kprime-inner',
])

const { k, q, n, eta1, eta2, du, dv } = data.params

// Mirrors KeyGenPage/EncapsPage's INPUTS -- but Decaps' own input (dk)
// isn't used directly past 'extract-data': the K-PKE-level steps work off
// dkPKE, the piece of dk actually extracted for decryption. So instead of
// one static list for the whole page, INPUT is scoped by tree level: level
// 0 (ML-KEM, outer) shows the whole dk Alice received; level 1/2 (Internal
// and K-PKE) show dkPKE, the value actually in scope once decryption is
// under way.
const INPUTS_ML_KEM = [
  { label: explanations.c.title, body: explanations.c.body, value: truncateHex(data.encaps.c) },
  { label: explanations.dk.title, body: explanations.dk.body, value: truncateHex(data.keygen.dk) },
]

const INPUTS_KPKE = [
  { label: explanations.c.title, body: explanations.c.body, value: truncateHex(data.encaps.c) },
  {
    label: <>dk<sub>pke</sub> (decryption key)</>,
    body: explanations.dkPKE.body,
    value: truncateHex(data.decaps.dk_pke),
  },
]

function getInputs(level) {
  return level === 0 ? INPUTS_ML_KEM : INPUTS_KPKE
}

// Mirrors EncapsPage's getParameters: which params a step's math actually
// depends on. Steps not listed here (transitions, or steps whose result
// doesn't depend on any parameter) fall through to the empty-array default.
function getParameters(stepId) {
  switch (stepId) {
    case 'extract-data':
      return [{ label: 'k', value: k }]
    case 'extract-c1-c2':
      return [{ label: 'k', value: k }, { label: 'du', value: du }, { label: 'dv', value: dv }]
    case 'decode-ciphertext':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'q', value: q }, { label: 'du', value: du }, { label: 'dv', value: dv }]
    case 'decode-secret-key':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'q', value: q }]
    case 'compute-message-poly':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'q', value: q }]
    case 'recover-plaintext':
      return [{ label: 'n', value: n }]
    case 're-encrypt':
      // Re-runs the full K-PKE encrypt internally to produce c' -- same
      // parameter set as Encaps' compute-u/compute-v/compress-pack combined.
      return [
        { label: 'k', value: k }, { label: 'n', value: n }, { label: 'q', value: q },
        { label: 'η₁', value: eta1 }, { label: 'η₂', value: eta2 },
        { label: 'du', value: du }, { label: 'dv', value: dv },
      ]
    default:
      return []
  }
}

// K-PKE.Decrypt's u/v are re-decoded from c1/c2 rather than being the
// same objects Bob computed (compression is lossy), so they get their own
// primed symbols (u', v') distinct from Encaps' u/v -- same idea as
// mPrime/KPrime/rPrime already being distinct from Encaps' m/K/r.
// `match` (data.decaps.match) is intentionally not included here -- it's a
// pass/fail comparison, not a value with its own popup, so it's shown as a
// direct visual indicator on the 'compare-c' step instead.
const BASE_GENERATED_VALUES = [
  { symbol: 'dkPKE', display: <>dk<sub>pke</sub></>, title: <>dk<sub>pke</sub> (private key material)</>, body: explanations.dkPKE.body, value: truncateHex(data.decaps.dk_pke) },
  { symbol: 'ekPKE', display: <>ek<sub>pke</sub></>, title: <>ek<sub>pke</sub> (public key material)</>, body: explanations.ekPKE.body, value: truncateHex(data.decaps.ek_pke) },
  { symbol: 'h', title: explanations.h.title, body: explanations.h.body, value: toSpacedHex(data.decaps.h) },
  { symbol: 'z', title: explanations.z.title, body: explanations.z.body, value: toSpacedHex(data.decaps.z) },
  { symbol: "u'", title: explanations.uPrime.title, body: explanations.uPrime.body, coeffsList: data.decaps.u_decoded.map(poly => poly.coeffs) },
  { symbol: "v'", title: explanations.vPrime.title, body: explanations.vPrime.body, coeffs: data.decaps.v_decoded.coeffs },
  { symbol: 'w', title: explanations.w.title, body: explanations.w.body, coeffs: data.decaps.w.coeffs },
  { symbol: "m'", title: explanations.mPrime.title, body: explanations.mPrime.body, value: toSpacedHex(data.decaps.m_prime) },
  { symbol: "K'", title: explanations.KPrime.title, body: explanations.KPrime.body, value: toSpacedHex(data.decaps.K_prime) },
  { symbol: "r'", title: explanations.rPrime.title, body: explanations.rPrime.body, value: toSpacedHex(data.decaps.r_prime) },
  { symbol: 'K̃', title: explanations.KTilde.title, body: explanations.KTilde.body, value: toSpacedHex(data.decaps.K_tilde) },
  { symbol: "c'", title: explanations.cPrime.title, body: explanations.cPrime.body, value: truncateHex(data.decaps.c_prime) },
  { symbol: 'K', title: explanations.KFinal.title, body: explanations.KFinal.body, value: toSpacedHex(data.decaps.K_final) },
]

// Mirrors EncapsPage's REVEAL_COUNTS: how many of the 13 values above are
// revealed ('done') by the time each step is reached. Every navigable step
// gets an entry, even where the count doesn't change from the step before,
// so a step that isn't in this list never accidentally resets to 0.
const REVEAL_COUNTS = {
  'run-internal': 0,
  'extract-data': 4,
  'decrypt-ciphertext': 4,
  'extract-c1-c2': 4,
  'decode-ciphertext': 6,
  'decode-secret-key': 6,
  'compute-message-poly': 7,
  'recover-plaintext': 8,
  'return-plaintext': 8,
  'derive-kprime-rprime': 10,
  'derive-ktilde': 11,
  're-encrypt': 11,
  'return-cprime': 12,
  'compare-c': 12,
  'return-kprime-inner': 12,
  'return-kprime': 13,
}

function getGeneratedValues(stepId) {
  const count = REVEAL_COUNTS[stepId] ?? 0
  return BASE_GENERATED_VALUES.map((item, i) => ({ ...item, state: i < count ? 'done' : 'pending' }))
}

function getStepContent(stepId) {
  switch (stepId) {
    case 'extract-data':
      return {
        formula: (
          <>
            dk<sub>pke</sub> ← dk[0 : 384k]{'\n'}
            ek<sub>pke</sub> ← dk[384k : 768k + 32]{'\n'}
            h ← dk[768k + 32 : 768k + 64]{'\n'}
            z ← dk[768k + 64 : 768k + 96]
          </>
        ),
        content: <ExtractDataStep />,
      }
    case 'extract-c1-c2':
      return {
        formula: (
          <>
            c1 ← c[0 : 32·du·k]{'\n'}
            c2 ← c[32·du·k : 32·(du·k + dv)]
          </>
        ),
        content: <ExtractC1C2Step />,
      }
    case 'decode-ciphertext':
      return {
        formula: (
          <>
            u' ← Decompress<sub>du</sub>(ByteDecode<sub>du</sub>(c1)){'\n'}
            v' ← Decompress<sub>dv</sub>(ByteDecode<sub>dv</sub>(c2))
          </>
        ),
        content: <DecodeCiphertextStep />,
      }
    case 'decode-secret-key':
      return {
        formula: <>ŝ ← ByteDecode<sub>12</sub>(dk<sub>pke</sub>)</>,
        content: <DecodeSecretKeyStep />,
      }
    case 'compute-message-poly':
      return {
        formula: "w ← v' − NTT⁻¹(ŝᵀ ∘ NTT(u'))",
        content: <ComputeWStep />,
      }
    case 'recover-plaintext':
      return {
        formula: 'm ← ByteEncode₁(Compress₁(w))',
        content: <RecoverPlaintextStep />,
      }
    case 'derive-kprime-rprime':
      return {
        formula: "(K', r') ← G(m'‖h)",
        content: <DeriveKprimeRprimeStep />,
      }
    case 'derive-ktilde':
      return {
        formula: 'K̃ ← J(z‖c)',
        content: <DeriveKtildeStep />,
      }
    case 'return-cprime':
      return {
        formula: "return c'",
        content: <ReturnCPrimeStep />,
      }
    case 'compare-c':
      return {
        formula: "c =? c'",
        content: <CompareCStep />,
      }
    case 'return-kprime':
      return {
        formula: "return K'",
        content: <ReturnKprimeStep />,
      }
    default:
      return { formula: null, content: null }
  }
}

// Mirrors EncapsPage's initial structure (AlgorithmPage + useStepNavigation)
// so the step tree and Prev/Next/skip-animation all work. Steps beyond
// 'extract-data' still fall back to a placeholder — fill in per-step
// formula/content the same way KeyGenPage/EncapsPage's getStepContent was
// built up.
function DecapsPage() {
  const navigate = useNavigate()
  // Starts one position before 'run-internal' (index 0) so the mount-time
  // goNext() below has an actual transition step to skip over -- landing
  // directly on index 0 would make that goNext() a same-tick single-step
  // advance (no skipped steps in between), which useStepNavigation defines
  // as instant, not the animated sweep every other multi-step skip gets.
  const { currentStepIndex, treeIndex, goNext, goPrev, isAnimating } =
    useStepNavigation(navSteps, TRANSITION_IDS, -1)

  // useLayoutEffect (not useEffect) so this fires before the browser paints
  // the transient index-(-1) frame -- the user never sees an empty/blank
  // tree flash before the sweep starts.
  useLayoutEffect(() => {
    goNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // currentStepIndex is briefly -1 (before the layout effect above commits
  // its first tick) -- falls back to index 0 for that one frame rather than
  // reading navSteps[-1].
  const currentStep = navSteps[currentStepIndex] ?? navSteps[0]
  const { formula, content } = getStepContent(currentStep.id)
  const parameters = getParameters(currentStep.id)
  const inputs = getInputs(currentStep.level)
  const generatedValues = getGeneratedValues(currentStep.id)

  const isLastStep = currentStepIndex === navSteps.length - 1

  function handlePrev() {
    // goPrev() returns false once it can't move back any further without
    // landing on a transition-only step (i.e. we're at the earliest real
    // step reachable from here) -- that's the same "leave the page" signal
    // KeyGen/EncapsPage get from currentStepIndex === 0, just expressed
    // differently here since index 0 ('run-internal') is never the step a
    // user actually sits on.
    if (!goPrev()) {
      navigate('/', { state: { keygenComplete: true, encapsComplete: true } })
    }
  }

  function handleNext() {
    // Mirrors KeyGenPage/EncapsPage's isLastStep -> navigate('/') pattern --
    // the whole pipeline is complete once Decaps' final step is reached.
    if (isLastStep) {
      navigate('/', { state: { keygenComplete: true, encapsComplete: true, decapsComplete: true } })
      return
    }
    goNext()
  }

  return (
    <AlgorithmPage
      title="Decapsulation"
      subtitle="Alice"
      breadcrumbStage="decaps"
      formulaContent={formula}
      steps={decapsSteps}
      currentStepIndex={treeIndex}
      parameters={parameters}
      inputs={inputs}
      outputs={['K (shared secret)']}
      generatedValues={generatedValues}
      canGoPrev={true}
      canGoNext={!isAnimating}
      onPrev={handlePrev}
      onNext={handleNext}
    >
      {content || <p className="body-text">{currentStep.label} — coming soon.</p>}
    </AlgorithmPage>
  )
}

export default DecapsPage
