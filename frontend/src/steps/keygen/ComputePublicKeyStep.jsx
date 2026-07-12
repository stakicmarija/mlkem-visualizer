import CompactMatrixField from '../../components/shared/matrix/CompactMatrixField.jsx'
import CompactVectorField from '../../components/shared/matrix/CompactVectorField.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './ComputePublicKeyStep.css'

function ComputePublicKeyStep() {
  return (
    <div className="compute-t-step">
      <div className="compute-t-step__equation">

        <div className="compute-t-step__operand">
          <CompactMatrixField
            symbol="A"
            colorToken="matrix-a"
            coeffsGrid={data.keygen.A.map(row => row.map(poly => poly.coeffs))}
            body={explanations.A.body}
          />
          <span className="compute-t-step__dim body-text">k×k</span>
        </div>

        <span className="compute-t-step__op body-text">×</span>

        <div className="compute-t-step__operand">
          <CompactVectorField
            symbol="s"
            colorToken="secret-s"
            coeffsList={data.keygen.s.map(poly => poly.coeffs_signed)}
            body={explanations.s.body}
          />
          <span className="compute-t-step__dim body-text">k×1</span>
        </div>

        <span className="compute-t-step__op body-text">+</span>

        <div className="compute-t-step__operand">
          <CompactVectorField
            symbol="e"
            colorToken="noise-e"
            coeffsList={data.keygen.e.map(poly => poly.coeffs_signed)}
            body={explanations.e.body}
          />
          <span className="compute-t-step__dim body-text">k×1</span>
        </div>

        <span className="compute-t-step__op body-text">=</span>

        <div className="compute-t-step__operand">
          <CompactVectorField
            symbol="t"
            colorToken="public-t"
            coeffsList={data.keygen.t.map(poly => poly.coeffs)}
            body={explanations.t.body}
          />
          <span className="compute-t-step__dim body-text">k×1</span>
        </div>

      </div>

      <p className="compute-t-step__note body-text">
        The public key t combines the public matrix A, the secret s, and small noise e. The noise
        makes it hard to recover s from t, the core hardness (LWE) behind ML-KEM's security.
      </p>
    </div>
  )
}

export default ComputePublicKeyStep
