import AlgorithmPage from '../components/layout/AlgorithmPage.jsx'
import CheckInputsStep from '../steps/keygen/CheckInputsStep.jsx'
import { keygenSteps } from '../data/steps.js'
import { explanations } from '../data/explanations.js'
import data from '../data/mlkem_768_data.json'

function toSpacedHex(hex) {
  return (hex.match(/.{2}/g) || []).join(' ')
}

const INPUTS = [
  { label: explanations.d.title, body: explanations.d.body, value: toSpacedHex(data.inputs.d) },
  { label: explanations.z.title, body: explanations.z.body, value: toSpacedHex(data.inputs.z) },
]

const GENERATED_VALUES = [
  { symbol: 'ρ', state: 'pending' },
  { symbol: 'σ', state: 'pending' },
  { symbol: 'A', state: 'pending' },
  { symbol: 's', state: 'pending' },
  { symbol: 'e', state: 'pending' },
  { symbol: 't', state: 'pending' },
  { symbol: 'ek', state: 'pending' },
  { symbol: 'dk', state: 'pending' },
]

function KeyGenPage() {
  return (
    <AlgorithmPage
      title="Key Generation"
      subtitle="Alice"
      formulaContent={"if d == NULL or z == NULL then\n   return ⊥"}
      steps={keygenSteps}
      currentStepIndex={0}
      parameters={[]}
      inputs={INPUTS}
      outputs={['ek (public key)', 'dk (private key)']}
      generatedValues={GENERATED_VALUES}
      canGoPrev={false}
      canGoNext={true}
      onPrev={() => {}}
      onNext={() => {}}
    >
      <CheckInputsStep />
    </AlgorithmPage>
  )
}

export default KeyGenPage
