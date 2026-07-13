import NttColumn from '../../components/shared/step-content/NttColumn.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './TransformNttStep.css'

// Mirrors KeyGen's TransformNttStep, but a single branch -- only y gets
// transformed here, not two parallel vectors like s/e.
function TransformNttStep() {
  return (
    <div className="transform-ntt-step">
      <NttColumn
        symbol="y"
        hatSymbol="ŷ"
        colorToken="ephemeral-y"
        coeffsList={data.encaps.y.map(poly => poly.coeffs_signed)}
        nttCoeffsList={data.encaps.y_ntt.map(poly => poly.coeffs)}
        body={explanations.y.body}
      />

      <p className="transform-ntt-step__note body-text">
        NTT converts each polynomial into a form where multiplication is fast (pointwise). Same
        polynomial, different representation.
      </p>
    </div>
  )
}

export default TransformNttStep
