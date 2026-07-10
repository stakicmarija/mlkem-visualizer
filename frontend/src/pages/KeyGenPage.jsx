import { useState } from 'react'
import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import CheckInputsStep from '../steps/keygen/CheckInputsStep.jsx'
import DeriveRhoSigmaStep from '../steps/keygen/DeriveRhoSigmaStep.jsx'
import { keygenSteps } from '../data/steps.js'
import { explanations } from '../data/explanations.js'
import data from '../data/mlkem_768_data.json'

function toSpacedHex(hex) {
  return (hex.match(/.{2}/g) || []).join(' ')
}

const navSteps = keygenSteps.filter(s => !s.isGroupLabel)

// Steps that only delegate — skip over them when navigating
const TRANSITION_IDS = new Set(['run-internal', 'generate-pke-pair'])

const INPUTS = [
  { label: explanations.d.title, body: explanations.d.body, value: toSpacedHex(data.inputs.d) },
  { label: explanations.z.title, body: explanations.z.body, value: toSpacedHex(data.inputs.z) },
]

const BASE_GENERATED_VALUES = [
  { symbol: 'ρ', title: explanations.rho.title, body: explanations.rho.body },
  { symbol: 'σ', title: explanations.sigma.title, body: explanations.sigma.body },
  { symbol: 'A', title: explanations.A.title },
  { symbol: 's', title: explanations.s.title },
  { symbol: 'e', title: explanations.e.title },
  { symbol: 't', title: explanations.t.title },
  { symbol: 'ek', title: explanations.ek.title },
  { symbol: 'dk', title: explanations.dk.title },
]

function getGeneratedValues(stepId) {
  if (stepId === 'derive-rho-sigma') {
    return BASE_GENERATED_VALUES.map((item, i) => ({
      ...item,
      state: i < 2 ? 'done' : 'pending',
      value: i === 0 ? toSpacedHex(data.keygen.rho)
           : i === 1 ? toSpacedHex(data.keygen.sigma)
           : undefined,
    }))
  }
  return BASE_GENERATED_VALUES.map(item => ({ ...item, state: 'pending' }))
}

function getStepContent(stepId) {
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
    default:
      return { formula: '', content: null }
  }
}

function KeyGenPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const currentStep = navSteps[currentStepIndex]
  const { formula, content } = getStepContent(currentStep.id)
  const generatedValues = getGeneratedValues(currentStep.id)

  function goNext() {
    let next = currentStepIndex + 1
    while (next < navSteps.length && TRANSITION_IDS.has(navSteps[next].id)) {
      next++
    }
    if (next < navSteps.length) setCurrentStepIndex(next)
  }

  function goPrev() {
    let prev = currentStepIndex - 1
    while (prev >= 0 && TRANSITION_IDS.has(navSteps[prev].id)) {
      prev--
    }
    if (prev >= 0) setCurrentStepIndex(prev)
  }

  return (
    <AlgorithmPage
      title="Key Generation"
      subtitle="Alice"
      formulaContent={formula}
      steps={keygenSteps}
      currentStepIndex={currentStepIndex}
      parameters={[]}
      inputs={INPUTS}
      outputs={['ek (public key)', 'dk (private key)']}
      generatedValues={generatedValues}
      canGoPrev={currentStepIndex > 0}
      canGoNext={currentStepIndex < navSteps.length - 1}
      onPrev={goPrev}
      onNext={goNext}
    >
      {content}
    </AlgorithmPage>
  )
}

export default KeyGenPage
