import SampleVectorStep from '../../components/shared/step-content/SampleVectorStep.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'

function GenerateErrorVectorStep({ hasSeenCbdAnimation, onOpenCbdAnimation }) {
  return (
    <SampleVectorStep
      label="e"
      colorToken="noise-e"
      explanationKey="e"
      vectors={data.keygen.e}
      prfRawHexes={data.keygen.e_prf_raw}
      seedExplanation={explanations.sigma}
      seedValue={toSpacedHex(data.keygen.sigma)}
      hasSeenCbdAnimation={hasSeenCbdAnimation}
      onOpenCbdAnimation={onOpenCbdAnimation}
    />
  )
}

export default GenerateErrorVectorStep
