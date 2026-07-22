import SampleVectorStep from '../../components/shared/step-content/SampleVectorStep.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'

function GenerateEphemeralYStep({ hasSeenCbdAnimation, onOpenCbdAnimation }) {
  return (
    <SampleVectorStep
      label="y"
      colorToken="ephemeral-y"
      explanationKey="y"
      seedLabel="r"
      seedExplanation={explanations.r}
      seedValue={toSpacedHex(data.encaps.r)}
      vectors={data.encaps.y}
      prfRawHexes={data.encaps.y_prf_raw}
      hasSeenCbdAnimation={hasSeenCbdAnimation}
      onOpenCbdAnimation={onOpenCbdAnimation}
    />
  )
}

export default GenerateEphemeralYStep
