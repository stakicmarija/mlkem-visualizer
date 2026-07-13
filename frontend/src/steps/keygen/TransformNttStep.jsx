import NttColumn from '../../components/shared/step-content/NttColumn.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './TransformNttStep.css'

function TransformNttStep() {
  return (
    <div className="transform-ntt-step">
      <div className="transform-ntt-step__columns">
        <NttColumn
          symbol="s"
          hatSymbol="ŝ"
          colorToken="secret-s"
          coeffsList={data.keygen.s.map(poly => poly.coeffs_signed)}
          nttCoeffsList={data.keygen.s_ntt.map(poly => poly.coeffs)}
          body={explanations.s.body}
        />
        <NttColumn
          symbol="e"
          hatSymbol="ê"
          colorToken="noise-e"
          coeffsList={data.keygen.e.map(poly => poly.coeffs_signed)}
          nttCoeffsList={data.keygen.e_ntt.map(poly => poly.coeffs)}
          body={explanations.e.body}
        />
      </div>

      <p className="transform-ntt-step__note body-text">
        NTT converts each polynomial into a form where multiplication is fast (pointwise). Same polynomial, different representation.
      </p>
    </div>
  )
}

export default TransformNttStep
