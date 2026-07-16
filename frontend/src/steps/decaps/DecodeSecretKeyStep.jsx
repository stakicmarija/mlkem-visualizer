import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './DecodeSecretKeyStep.css'

const SUB = ['₀', '₁', '₂']

// ŝ is a k=3 vector, same shape as t̂ in DecodePublicKeyStep -- reuse the
// same cycling-popup pattern. ŝ here is mathematically identical to
// data.keygen.s_ntt (dkPKE was packed from exactly this value during
// KeyGen, ByteDecode just recovers it), so reuse it directly rather than
// recomputing.
function DecodeSecretKeyStep() {
  const sPopup = useCellPopup(data.keygen.s_ntt.length)
  const sLabel = sPopup.index !== null ? `ŝ${SUB[sPopup.index]}` : null

  return (
    <div className="decode-secret-key-step">
      <Node label={<>dk<sub>pke</sub></>} />

      <div className="decode-secret-key-step__vline" />

      <TransformBox name="Byte Decode" explanationKey="ByteDecode" />

      <div className="decode-secret-key-step__vline" />

      <Node label="ŝ" variant="leaf" onClick={() => sPopup.open(0)} />

      {sPopup.isOpen && (
        <Popup
          title={sLabel}
          body={explanations.s.body}
          polynomialPreview={formatPolynomialPreview(sLabel, data.keygen.s_ntt[sPopup.index].coeffs)}
          fullCoefficients={data.keygen.s_ntt[sPopup.index].coeffs}
          onPrev={sPopup.goPrev}
          onNext={sPopup.goNext}
          hasPrev={sPopup.hasPrev}
          hasNext={sPopup.hasNext}
          isOpen
          onClose={sPopup.close}
        />
      )}
    </div>
  )
}

export default DecodeSecretKeyStep
