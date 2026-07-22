import SampleVectorStep from '../../components/shared/step-content/SampleVectorStep.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'

function GenerateSecretVectorStep({ hasSeenCbdAnimation, onOpenCbdAnimation }) {
  return (
    <SampleVectorStep
      label="s"
      colorToken="secret-s"
      explanationKey="s"
      vectors={data.keygen.s}
      prfRawHexes={data.keygen.s_prf_raw}
      seedExplanation={explanations.sigma}
      seedValue={toSpacedHex(data.keygen.sigma)}
      hasSeenCbdAnimation={hasSeenCbdAnimation}
      onOpenCbdAnimation={onOpenCbdAnimation}
    />
  )
}

export default GenerateSecretVectorStep
