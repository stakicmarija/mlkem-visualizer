import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import CompactSingleField from '../../components/shared/matrix/CompactSingleField.jsx'
import DecompressPopupBody from '../../components/shared/popup/DecompressPopupBody.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './EncodePlaintextStep.css'

function EncodePlaintextStep() {
  return (
    <div className="encode-plaintext-step">
      <Node label="m" />

      <div className="encode-plaintext-step__vline" />

      <TransformBox name="Byte Decode" explanationKey="ByteDecode1" />

      <div className="encode-plaintext-step__vline" />

      <Node label="m" microLabel="bits" />

      <div className="encode-plaintext-step__vline" />

      <TransformBox
        name="Decompress"
        explanationKey="Decompress"
        popupChildren={<DecompressPopupBody />}
      />

      <div className="encode-plaintext-step__vline" />

      <CompactSingleField
        symbol="μ"
        colorToken="encoded-message"
        coeffs={data.encaps.mu.coeffs}
        body={explanations.mu.body}
      />
    </div>
  )
}

export default EncodePlaintextStep
