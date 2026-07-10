import TransformBox from '../../components/shared/TransformBox.jsx'
import CbdPopupBody from '../../components/shared/CbdPopupBody.jsx'
import data from '../../data/mlkem_768_data.json'
import './GenerateSecretVectorStep.css'

function GenerateSecretVectorStep() {
  const cbdPopup = (
    <CbdPopupBody
      prfRawHex={data.keygen.s_prf_raw[0]}
      coeffsSigned={data.keygen.s[0].coeffs_signed}
    />
  )

  return (
    <div className="generate-secret-vector">
      <TransformBox
        name="SamplePolyCBD"
        explanationKey="SamplePolyCBD"
        popupChildren={cbdPopup}
      />
    </div>
  )
}

export default GenerateSecretVectorStep
