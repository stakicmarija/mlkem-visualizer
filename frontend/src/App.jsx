import { useState } from 'react'
import "./App.css";
import AlgorithmPage from './components/layout/AlgorithmPage.jsx'
import { keygenSteps } from './data/steps.js'

const TEST_PARAMS = [
  { label: 'k', value: '3' },
  { label: 'η₁', value: '2' },
  { label: 'η₂', value: '2' },
]

const TEST_INPUTS = [
  { label: 'ρ', value: 'a3f1b2c4...bb92 (32 bytes, seed for matrix A)' },
  { label: 'σ', value: 'c7e2d901...4401 (32 bytes, seed for secrets)' },
]

const TEST_GENERATED = [
  { symbol: 'ρ', state: 'done', value: 'a3f1...bb92' },
  { symbol: 'σ', state: 'done', value: 'c7e2...4401' },
  { symbol: 'A', state: 'done', value: '[[...]]' },
  { symbol: 's', state: 'loading' },
  { symbol: 'e', state: 'pending' },
  { symbol: 't', state: 'pending' },
]

function App() {
  const [stepIndex, setStepIndex] = useState(4)
  const navSteps = keygenSteps.filter(s => !s.isGroupLabel)

  return (
    <AlgorithmPage
      title="Key Generation"
      subtitle="ML-KEM-768 · FIPS 203"
      formulaContent="(ek, dk) ← ML-KEM.KeyGen()"
      steps={keygenSteps}
      currentStepIndex={stepIndex}
      onStepClick={s => {
        const pos = navSteps.findIndex(n => n.id === s.id)
        if (pos !== -1) setStepIndex(pos)
      }}
      parameters={TEST_PARAMS}
      inputs={TEST_INPUTS}
      outputs={['ek (encapsulation key)', 'dk (decapsulation key)']}
      generatedValues={TEST_GENERATED}
      canGoPrev={stepIndex > 0}
      canGoNext={stepIndex < navSteps.length - 1}
      onPrev={() => setStepIndex(i => Math.max(0, i - 1))}
      onNext={() => setStepIndex(i => Math.min(navSteps.length - 1, i + 1))}
    >
      <div style={{ padding: 32, background: 'var(--color-surface)', borderRadius: 8, textAlign: 'center' }}>
        <p className="body-text" style={{ color: 'var(--color-text-secondary)' }}>
          Step content goes here — diagram, value grid, etc.
        </p>
      </div>
    </AlgorithmPage>
  )
}

export default App
