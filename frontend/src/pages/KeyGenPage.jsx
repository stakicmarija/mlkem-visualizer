import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStepNavigation } from '../utils/useStepNavigation.js'
import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import CheckInputsStep from '../steps/keygen/CheckInputsStep.jsx'
import DeriveRhoSigmaStep from '../steps/keygen/DeriveRhoSigmaStep.jsx'
import ExpandMatrixAStep from '../steps/keygen/ExpandMatrixAStep.jsx'
import GenerateSecretVectorStep from '../steps/keygen/GenerateSecretVectorStep.jsx'
import GenerateErrorVectorStep from '../steps/keygen/GenerateErrorVectorStep.jsx'
import TransformNttStep from '../steps/keygen/TransformNttStep.jsx'
import ComputePublicKeyStep from '../steps/keygen/ComputePublicKeyStep.jsx'
import PackKeysStep from '../steps/keygen/PackKeysStep.jsx'
import BuildDkStep from '../steps/keygen/BuildDkStep.jsx'
import ReturnKeysStep from '../steps/keygen/ReturnKeysStep.jsx'
import { keygenSteps } from '../data/steps.js'
import { explanations } from '../data/explanations.js'
import { toSpacedHex, truncateHex } from '../utils/hex.js'
import data from '../data/mlkem_768_data.json'

const navSteps = keygenSteps.filter(s => !s.isGroupLabel)

// Steps that only delegate, or aren't built yet — skip over them when navigating
const TRANSITION_IDS = new Set(['run-internal', 'generate-pke-pair'])

const { k, q, n, eta1 } = data.params

function getParameters(stepId) {
  switch (stepId) {
    case 'derive-rho-sigma':
      return [{ label: 'k', value: k }]
    case 'expand-matrix-a':
    case 'compute-t':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'q', value: q }]
    case 'generate-secret-vector':
    case 'generate-error-vector':
      return [{ label: 'k', value: k }, { label: 'n', value: n }, { label: 'η₁', value: eta1 }]
    case 'transform-ntt':
      return [{ label: 'n', value: n }]
    default:
      return []
  }
}

const INPUTS = [
  { label: explanations.d.title, body: explanations.d.body, value: toSpacedHex(data.inputs.d) },
  { label: explanations.z.title, body: explanations.z.body, value: toSpacedHex(data.inputs.z) },
]

const BASE_GENERATED_VALUES = [
  { symbol: 'ρ', title: explanations.rho.title, body: explanations.rho.body },
  { symbol: 'σ', title: explanations.sigma.title, body: explanations.sigma.body },
  {
    symbol: 'A',
    title: explanations.A.title,
    body: explanations.A.body,
    coeffsGrid: data.keygen.A.map(row => row.map(poly => poly.coeffs)),
  },
  {
    symbol: 's',
    title: explanations.s.title,
    body: explanations.s.body,
    coeffsList: data.keygen.s.map(poly => poly.coeffs_signed),
  },
  {
    symbol: 'e',
    title: explanations.e.title,
    body: explanations.e.body,
    coeffsList: data.keygen.e.map(poly => poly.coeffs_signed),
  },
  {
    symbol: 't',
    title: explanations.t.title,
    body: explanations.t.body,
    coeffsList: data.keygen.t.map(poly => poly.coeffs),
  },
  {
    symbol: 'ekPke',
    display: <>ek<sub>pke</sub></>,
    title: explanations.ekPke.title,
    body: explanations.ekPke.body,
    value: truncateHex(data.keygen.ek_pke),
  },
  {
    symbol: 'dkPke',
    display: <>dk<sub>pke</sub></>,
    title: explanations.dkPke.title,
    body: explanations.dkPke.body,
    value: truncateHex(data.keygen.dk_pke),
  },
  { symbol: 'ek', title: explanations.ek.title, body: explanations.ek.body, value: truncateHex(data.keygen.ek) },
  { symbol: 'dk', title: explanations.dk.title, body: explanations.dk.body, value: truncateHex(data.keygen.dk) },
]

// Order steps occur in, so a symbol's "done" threshold can be compared by
// position instead of a hand-maintained index cutoff per step.
const STEP_ORDER = [
  'derive-rho-sigma',
  'expand-matrix-a',
  'generate-secret-vector',
  'generate-error-vector',
  'transform-ntt',
  'compute-t',
  'pack-keys',
  'build-dk',
  'return-ek-dk',
]

// Step at which each tracked value is first produced.
const SYMBOL_DONE_AT = {
  'ρ': 'derive-rho-sigma',
  'σ': 'derive-rho-sigma',
  A: 'expand-matrix-a',
  s: 'generate-secret-vector',
  e: 'generate-error-vector',
  t: 'compute-t',
  ekPke: 'pack-keys',
  dkPke: 'pack-keys',
  ek: 'build-dk',
  dk: 'build-dk',
}

function getGeneratedValues(stepId) {
  const currentIndex = STEP_ORDER.indexOf(stepId)
  return BASE_GENERATED_VALUES.map(item => {
    const doneAtIndex = STEP_ORDER.indexOf(SYMBOL_DONE_AT[item.symbol])
    const state = currentIndex >= 0 && currentIndex >= doneAtIndex ? 'done' : 'pending'
    return {
      ...item,
      state,
      value: item.symbol === 'ρ' ? toSpacedHex(data.keygen.rho)
           : item.symbol === 'σ' ? toSpacedHex(data.keygen.sigma)
           : item.value,
    }
  })
}

// seenAnimations/markAnimationSeen: lifted above the per-step remount
// boundary (see ExpandMatrixAStep's replay-button comments for why steps
// remount on every navigation) so a SamplePolyCBD box's "already opened"
// state survives Prev/Next between steps within this page. Step ids are
// already unique within a page, so they double as the seen-state keys.
function getStepContent(stepId, seenAnimations, markAnimationSeen) {
  switch (stepId) {
    case 'check-inputs':
      return {
        formula: 'if d == NULL or z == NULL then\n   return ⊥',
        content: <CheckInputsStep />,
      }
    case 'derive-rho-sigma':
      return {
        formula: '(ρ, σ) ← G(d‖k)',
        content: <DeriveRhoSigmaStep />,
      }
    case 'expand-matrix-a':
      return {
        formula: 'for (i ← 0; i < k; i++)\n   for (j ← 0; j < k; j++)\n         A[i, j] ← SampleNTT(ρ‖j‖i)',
        content: <ExpandMatrixAStep />,
      }
    case 'generate-secret-vector':
      return {
        formula: 'for (i ← 0; i < k; i++)\n   s[i] ← SamplePolyCBD(PRF(σ, N))\n   N ← N + 1',
        content: (
          <GenerateSecretVectorStep
            hasSeenCbdAnimation={seenAnimations.has(stepId)}
            onOpenCbdAnimation={() => markAnimationSeen(stepId)}
          />
        ),
      }
    case 'generate-error-vector':
      return {
        formula: 'for (i ← 0; i < k; i++)\n   e[i] ← SamplePolyCBD(PRF(σ, N))\n   N ← N + 1',
        content: (
          <GenerateErrorVectorStep
            hasSeenCbdAnimation={seenAnimations.has(stepId)}
            onOpenCbdAnimation={() => markAnimationSeen(stepId)}
          />
        ),
      }
    case 'transform-ntt':
      return {
        formula: 'ŝ ← NTT(s)\nê ← NTT(e)',
        content: <TransformNttStep />,
      }
    case 'compute-t':
      return {
        formula: 't ← A · s + e',
        content: <ComputePublicKeyStep />,
      }
    case 'pack-keys':
      return {
        formula: (
          <>
            ek<sub>pke</sub>{' ← ByteEncode₁₂(t)‖ρ\n'}
            dk<sub>pke</sub>{' ← ByteEncode₁₂(s)'}
          </>
        ),
        content: <PackKeysStep />,
      }
    case 'build-dk':
      return {
        formula: (
          <>
            {'ek ← ek'}<sub>pke</sub>{'\ndk ← (dk'}<sub>pke</sub>{'‖ek‖H(ek)‖z)'}
          </>
        ),
        content: <BuildDkStep />,
      }
    case 'return-ek-dk':
      return {
        formula: 'return (ek, dk)',
        content: <ReturnKeysStep />,
      }
    default:
      return { formula: '', content: null }
  }
}

function KeyGenPage() {
  const navigate = useNavigate()
  const { currentStepIndex, treeIndex, goNext, goPrev, isAnimating } =
    useStepNavigation(navSteps, TRANSITION_IDS)
  const [seenAnimations, setSeenAnimations] = useState(() => new Set())
  const markAnimationSeen = id =>
    setSeenAnimations(prev => (prev.has(id) ? prev : new Set(prev).add(id)))

  const currentStep = navSteps[currentStepIndex]
  const { formula, content } = getStepContent(currentStep.id, seenAnimations, markAnimationSeen)
  const generatedValues = getGeneratedValues(currentStep.id)
  const parameters = getParameters(currentStep.id)

  const isLastStep = currentStepIndex === navSteps.length - 1

  function handlePrev() {
    if (currentStepIndex === 0) {
      navigate('/')
      return
    }
    goPrev()
  }

  function handleNext() {
    if (isLastStep) {
      // justArrived tells HomePage this is the natural forward arrival, so
      // the ek travel animation should play. Any other way of landing on
      // '/' with keygenComplete (breadcrumb, browser back/forward, Prev
      // from Encaps) omits it, showing the settled end state immediately.
      navigate('/', { state: { keygenComplete: true, justArrived: true } })
      return
    }
    goNext()
  }

  return (
    <AlgorithmPage
      title="Key Generation"
      subtitle="Alice"
      breadcrumbStage="keygen"
      formulaContent={formula}
      steps={keygenSteps}
      currentStepIndex={treeIndex}
      parameters={parameters}
      inputs={INPUTS}
      outputs={['ek (public key)', 'dk (private key)']}
      generatedValues={generatedValues}
      canGoPrev={true}
      canGoNext={!isAnimating}
      onPrev={handlePrev}
      onNext={handleNext}
    >
      {content}
    </AlgorithmPage>
  )
}

export default KeyGenPage
