import SampleVectorStep from '../../components/shared/SampleVectorStep.jsx'
import data from '../../data/mlkem_768_data.json'

function GenerateErrorVectorStep() {
  return (
    <SampleVectorStep
      label="e"
      colorToken="noise-e"
      explanationKey="e"
      vectors={data.keygen.e}
      prfRawHexes={data.keygen.e_prf_raw}
    />
  )
}

export default GenerateErrorVectorStep
