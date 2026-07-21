import SampleVectorStep from '../../components/shared/step-content/SampleVectorStep.jsx'
import data from '../../data/mlkem_768_data.json'

function GenerateEphemeralYStep({ hasSeenCbdAnimation, onOpenCbdAnimation }) {
  return (
    <SampleVectorStep
      label="y"
      colorToken="ephemeral-y"
      explanationKey="y"
      seedLabel="r"
      vectors={data.encaps.y}
      prfRawHexes={data.encaps.y_prf_raw}
      hasSeenCbdAnimation={hasSeenCbdAnimation}
      onOpenCbdAnimation={onOpenCbdAnimation}
    />
  )
}

export default GenerateEphemeralYStep
