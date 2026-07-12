import PageHeader from './PageHeader.jsx'
import FormulaBox from '../shared/step-content/FormulaBox.jsx'
import StepTree from './StepTree.jsx'
import ParamsPanel from './ParamsPanel.jsx'
import GeneratedValuesPanel from './GeneratedValuesPanel.jsx'
import Button from '../shared/buttons/Button.jsx'
import Footer from './Footer.jsx'
import './AlgorithmPage.css'

function AlgorithmPage({
  title,
  subtitle,
  formulaContent,
  steps,
  currentStepIndex,
  onStepClick,
  parameters,
  inputs,
  outputs,
  generatedValues,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  children,
}) {
  return (
    <div className="algorithm-page">
      <div className="algorithm-page__top">
        <PageHeader title={title} subtitle={subtitle} />
      </div>

      <div className="algorithm-page__body">
        <div className="algorithm-page__left">
          <StepTree
            steps={steps}
            currentStepIndex={currentStepIndex}
            onStepClick={onStepClick}
          />
        </div>

        <div className="algorithm-page__center">
          {formulaContent && <FormulaBox>{formulaContent}</FormulaBox>}
          {children}
        </div>

        <div className="algorithm-page__right">
          <ParamsPanel
            parameters={parameters}
            inputs={inputs}
            outputs={outputs}
          />
          <GeneratedValuesPanel items={generatedValues} />
        </div>
      </div>

      <div className="algorithm-page__nav">
        <Button variant="secondary" icon="prev" onClick={onPrev} disabled={!canGoPrev}>
          Prev
        </Button>
        <Button variant="primary" icon="next" onClick={onNext} disabled={!canGoNext}>
          Next
        </Button>
      </div>

      <Footer
        label="DIPLOMA THESIS"
        name="MARIJA STAKIĆ"
        university="UNIVERSITY OF BELGRADE"
        year="2026"
      />
    </div>
  )
}

export default AlgorithmPage
