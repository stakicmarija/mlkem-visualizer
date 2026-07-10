import SampleVectorStep from '../../components/shared/SampleVectorStep.jsx'
import data from '../../data/mlkem_768_data.json'

function GenerateSecretVectorStep() {
  return (
    <SampleVectorStep
      label="s"
      colorToken="secret-s"
      explanationKey="s"
      vectors={data.keygen.s}
      prfRawHexes={data.keygen.s_prf_raw}
    />
  )
}

export default GenerateSecretVectorStep
