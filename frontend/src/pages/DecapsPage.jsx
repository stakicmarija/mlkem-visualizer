import { useNavigate } from 'react-router-dom'
import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import { decapsSteps } from '../data/steps.js'
import { useStepNavigation } from '../utils/useStepNavigation.js'

const navSteps = decapsSteps.filter(s => !s.isGroupLabel)

// Mirrors KeyGenPage/EncapsPage's TRANSITION_IDS: steps that only delegate,
// with no content of their own.
const TRANSITION_IDS = new Set(['run-internal'])

// Shell only for now — mirrors EncapsPage's initial structure (AlgorithmPage
// + useStepNavigation) so the step tree and Prev/Next/skip-animation all
// work, but no step has real content yet. Fill in per-step formula/content
// the same way KeyGenPage/EncapsPage's getStepContent was built up.
function DecapsPage() {
  const navigate = useNavigate()
  const { currentStepIndex, treeIndex, goNext, goPrev, isAnimating } =
    useStepNavigation(navSteps, TRANSITION_IDS)

  const currentStep = navSteps[currentStepIndex]

  function handlePrev() {
    if (currentStepIndex === 0) {
      navigate('/', { state: { keygenComplete: true, encapsComplete: true } })
      return
    }
    goPrev()
  }

  return (
    <AlgorithmPage
      title="Decapsulation"
      subtitle="Alice"
      formulaContent={null}
      steps={decapsSteps}
      currentStepIndex={treeIndex}
      parameters={[]}
      inputs={[]}
      outputs={['K (shared secret)']}
      generatedValues={[]}
      canGoPrev={true}
      canGoNext={!isAnimating}
      onPrev={handlePrev}
      onNext={goNext}
    >
      <p className="body-text">{currentStep.label} — coming soon.</p>
    </AlgorithmPage>
  )
}

export default DecapsPage
