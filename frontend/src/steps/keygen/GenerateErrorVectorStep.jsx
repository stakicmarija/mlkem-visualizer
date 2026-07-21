import SampleVectorStep from '../../components/shared/step-content/SampleVectorStep.jsx'
import data from '../../data/mlkem_768_data.json'

function GenerateErrorVectorStep({ hasSeenCbdAnimation, onOpenCbdAnimation }) {
  return (
    <SampleVectorStep
      label="e"
      colorToken="noise-e"
      explanationKey="e"
      vectors={data.keygen.e}
      prfRawHexes={data.keygen.e_prf_raw}
      hasSeenCbdAnimation={hasSeenCbdAnimation}
      onOpenCbdAnimation={onOpenCbdAnimation}
    />
  )
}

export default GenerateErrorVectorStep
