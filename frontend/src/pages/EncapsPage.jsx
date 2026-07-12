import { useNavigate } from 'react-router-dom'
import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import { encapsSteps } from '../data/steps.js'
import { useStepNavigation } from '../utils/useStepNavigation.js'

const navSteps = encapsSteps.filter(s => !s.isGroupLabel)

// Mirrors KeyGenPage's TRANSITION_IDS: steps that only delegate, with no
// content of their own — 'encrypt-m' fans straight into K-PKE the same
// way 'generate-pke-pair' does in KeyGen.
const TRANSITION_IDS = new Set(['run-internal', 'encrypt-m'])

// Shell only for now — mirrors KeyGenPage's structure (AlgorithmPage +
// useStepNavigation) so the step tree and Prev/Next/skip-animation all
// work, but no step has real content yet. Fill in per-step formula/content
// the same way KeyGenPage's getStepContent was built up.
function EncapsPage() {
  const navigate = useNavigate()
  const { currentStepIndex, treeIndex, goNext, goPrev, isAnimating } =
    useStepNavigation(navSteps, TRANSITION_IDS)

  const currentStep = navSteps[currentStepIndex]

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
      formulaContent={null}
      steps={encapsSteps}
      currentStepIndex={treeIndex}
      parameters={[]}
      inputs={[]}
      outputs={['K (shared secret)', 'c (ciphertext)']}
      generatedValues={[]}
      canGoPrev={true}
      canGoNext={!isAnimating && currentStepIndex < navSteps.length - 1}
      onPrev={handlePrev}
      onNext={goNext}
    >
      <p className="body-text">{currentStep.label} — coming soon.</p>
    </AlgorithmPage>
  )
}

export default EncapsPage
