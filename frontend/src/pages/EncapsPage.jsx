import { useNavigate } from 'react-router-dom'
import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import GenerateMStep from '../steps/encaps/GenerateMStep.jsx'
import DeriveKRStep from '../steps/encaps/DeriveKRStep.jsx'
import DecodePublicKeyStep from '../steps/encaps/DecodePublicKeyStep.jsx'
import RegenerateMatrixAStep from '../steps/encaps/RegenerateMatrixAStep.jsx'
import { encapsSteps } from '../data/steps.js'
import { explanations } from '../data/explanations.js'
import { toSpacedHex, truncateHex } from '../utils/hex.js'
import { useStepNavigation } from '../utils/useStepNavigation.js'
import data from '../data/mlkem_768_data.json'

const navSteps = encapsSteps.filter(s => !s.isGroupLabel)

// Mirrors KeyGenPage's TRANSITION_IDS: steps that only delegate, with no
// content of their own — 'encrypt-m' fans straight into K-PKE the same
// way 'generate-pke-pair' does in KeyGen.
const TRANSITION_IDS = new Set(['run-internal', 'encrypt-m'])

const { k, q, n, eta1, eta2, du, dv } = data.params

// Inputs to the whole algorithm — shown on every step, same as KeyGenPage's
// INPUTS (d, z). ek is Alice's public key Bob already received; m is the
// random message Bob generates in the first step.
const INPUTS = [
  { label: 'ek (public key)', body: explanations.ek.body, value: truncateHex(data.keygen.ek) },
  { label: 'm (32B seed)', body: explanations.m.body, value: toSpacedHex(data.inputs.m) },
]

function getParameters(stepId) {
  switch (stepId) {
    case 'decode-public-key':
      return [{ label: 'k', value: k }]
    case 'regenerate-matrix-a':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'q', value: q }]
    case 'generate-ephemeral-y':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'η₁', value: eta1 }]
    case 'generate-error-vectors':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'η₂', value: eta2 }]
    case 'transform-ntt':
      return [{ label: 'n', value: n }]
    case 'compute-u':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'q', value: q }, { label: 'du', value: du }]
    case 'encode-plaintext':
      return [{ label: 'n', value: n }]
    case 'compute-v':
      return [{ label: 'n', value: n }, { label: 'q', value: q }, { label: 'dv', value: dv }]
    case 'compress-pack':
      return [{ label: 'du', value: du }, { label: 'dv', value: dv }]
    default:
      return []
  }
}

// K, r, y, e1, e2, u, μ, v, c — the 9 values tracked in the GENERATED
// VALUES panel throughout encapsulation. y/e1/e2 are CBD-sampled ("small"),
// so per CLAUDE.md they show coeffs_signed; u/μ/v are uniformly-random-ish
// results, so they show the mod-q coeffs. Not included: A (already covered
// by "Regenerate matrix A"'s own grid) and m (shown as an INPUT, not a
// generated value).
const BASE_GENERATED_VALUES = [
  { symbol: 'K', title: explanations.K.title, body: explanations.K.body, value: toSpacedHex(data.encaps.K) },
  { symbol: 'r', title: explanations.r.title, body: explanations.r.body, value: toSpacedHex(data.encaps.r) },
  { symbol: 'y', title: explanations.y.title, body: explanations.y.body, coeffsList: data.encaps.y.map(poly => poly.coeffs_signed) },
  { symbol: 'e1', title: explanations.e1.title, body: explanations.e1.body, coeffsList: data.encaps.e1.map(poly => poly.coeffs_signed) },
  { symbol: 'e2', title: explanations.e2.title, body: explanations.e2.body, coeffs: data.encaps.e2.coeffs_signed },
  { symbol: 'u', title: explanations.u.title, body: explanations.u.body, coeffsList: data.encaps.u.map(poly => poly.coeffs) },
  { symbol: 'μ', title: explanations.mu.title, body: explanations.mu.body, coeffs: data.encaps.mu.coeffs },
  { symbol: 'v', title: explanations.v.title, body: explanations.v.body, coeffs: data.encaps.v.coeffs },
  { symbol: 'c', title: explanations.c.title, body: explanations.c.body, value: truncateHex(data.encaps.c) },
]

// How many of the 9 values above are revealed ('done') by the time each
// step is reached — mirrors KeyGenPage's per-step progressive reveal.
const REVEAL_COUNTS = {
  'generate-m': 0,
  'derive-k-r': 2,
  'decode-public-key': 2,
  'regenerate-matrix-a': 2,
  'generate-ephemeral-y': 3,
  'generate-error-vectors': 5,
  'transform-ntt': 5,
  'compute-u': 6,
  'encode-plaintext': 7,
  'compute-v': 8,
  'compress-pack': 9,
  'return-kc-inner': 9,
  'return-kc': 9,
}

function getGeneratedValues(stepId) {
  const count = REVEAL_COUNTS[stepId] ?? 0
  return BASE_GENERATED_VALUES.map((item, i) => ({ ...item, state: i < count ? 'done' : 'pending' }))
}

function getStepContent(stepId) {
  switch (stepId) {
    case 'generate-m':
      return {
        formula: 'if m == NULL then\n   return ⊥',
        content: <GenerateMStep />,
      }
    case 'derive-k-r':
      return {
        formula: '(K, r) ← G(m‖H(ek))',
        content: <DeriveKRStep />,
      }
    case 'decode-public-key':
      return {
        formula: (
          <>
            t̂ ← ByteDecode₁₂(ek<sub>pke</sub>{'[0 : 384k])\n'}
            ρ ← ek<sub>pke</sub>{'[384k : 384k + 32]'}
          </>
        ),
        content: <DecodePublicKeyStep />,
      }
    case 'regenerate-matrix-a':
      return {
        formula: 'for (i ← 0; i < k; i++)\n   for (j ← 0; j < k; j++)\n         A[i, j] ← SampleNTT(ρ‖j‖i)',
        content: <RegenerateMatrixAStep />,
      }
    default:
      return { formula: '', content: null }
  }
}

// Mirrors KeyGenPage's structure (AlgorithmPage + useStepNavigation) so the
// step tree and Prev/Next/skip-animation all work. Steps beyond 'generate-m'
// still fall back to a placeholder — fill in per-step formula/content the
// same way KeyGenPage's getStepContent was built up.
function EncapsPage() {
  const navigate = useNavigate()
  const { currentStepIndex, treeIndex, goNext, goPrev, isAnimating } =
    useStepNavigation(navSteps, TRANSITION_IDS)

  const currentStep = navSteps[currentStepIndex]
  const { formula, content } = getStepContent(currentStep.id)
  const parameters = getParameters(currentStep.id)
  const generatedValues = getGeneratedValues(currentStep.id)

  const isLastStep = currentStepIndex === navSteps.length - 1

  function handlePrev() {
    if (currentStepIndex === 0) {
      navigate('/', { state: { keygenComplete: true } })
      return
    }
    goPrev()
  }

  function handleNext() {
    if (isLastStep) {
      navigate('/', { state: { keygenComplete: true, encapsComplete: true } })
      return
    }
    goNext()
  }

  return (
    <AlgorithmPage
      title="Encapsulation"
      subtitle="Bob"
      breadcrumbStage="encaps"
      formulaContent={formula}
      steps={encapsSteps}
      currentStepIndex={treeIndex}
      parameters={parameters}
      inputs={INPUTS}
      outputs={['K (shared secret)', 'c (ciphertext)']}
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

export default EncapsPage
