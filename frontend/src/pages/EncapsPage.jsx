import { useNavigate } from 'react-router-dom'
import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import GenerateMStep from '../steps/encaps/GenerateMStep.jsx'
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

// Inputs to the whole algorithm — shown on every step, same as KeyGenPage's
// INPUTS (d, z). ek is Alice's public key Bob already received; m is the
// random message Bob generates in the first step.
const INPUTS = [
  { label: 'ek (public key)', body: explanations.ek.body, value: truncateHex(data.keygen.ek) },
  { label: 'm (32B seed)', body: explanations.m.body, value: toSpacedHex(data.inputs.m) },
]

function getStepContent(stepId) {
  switch (stepId) {
    case 'generate-m':
      return {
        formula: 'if m == NULL then\n   return ⊥',
        content: <GenerateMStep />,
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

  function handlePrev() {
    if (currentStepIndex === 0) {
      navigate('/', { state: { keygenComplete: true } })
      return
    }
    goPrev()
  }

  return (
    <AlgorithmPage
      title="Encapsulation"
      subtitle="Bob"
      formulaContent={formula}
      steps={encapsSteps}
      currentStepIndex={treeIndex}
      parameters={[]}
      inputs={INPUTS}
      outputs={['K (shared secret)', 'c (ciphertext)']}
      generatedValues={[]}
      canGoPrev={true}
      canGoNext={!isAnimating && currentStepIndex < navSteps.length - 1}
      onPrev={handlePrev}
      onNext={goNext}
    >
      {content || <p className="body-text">{currentStep.label} — coming soon.</p>}
    </AlgorithmPage>
  )
}

export default EncapsPage
