import CompactVectorField from '../../components/shared/matrix/CompactVectorField.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './TransformNttStep.css'

const HAT = { s: 'ŝ', e: 'ê' }

// Compact input block → NTT box → compact NTT-form block. Same pattern for s and e.
function NttColumn({ symbol, colorToken, coeffsList, nttCoeffsList, body }) {
  return (
    <div className="transform-ntt-step__column">
      <CompactVectorField symbol={symbol} colorToken={colorToken} coeffsList={coeffsList} body={body} />

      <div className="transform-ntt-step__vline" />
      <TransformBox name="NTT" explanationKey="NTT" />
      <div className="transform-ntt-step__vline" />

      <CompactVectorField
        symbol={HAT[symbol]}
        colorToken={colorToken}
        coeffsList={nttCoeffsList}
        body={body}
        strong
      />
    </div>
  )
}

function TransformNttStep() {
  return (
    <div className="transform-ntt-step">
      <div className="transform-ntt-step__columns">
        <NttColumn
          symbol="s"
          colorToken="secret-s"
          coeffsList={data.keygen.s.map(poly => poly.coeffs_signed)}
          nttCoeffsList={data.keygen.s_ntt.map(poly => poly.coeffs)}
          body={explanations.s.body}
        />
        <NttColumn
          symbol="e"
          colorToken="noise-e"
          coeffsList={data.keygen.e.map(poly => poly.coeffs_signed)}
          nttCoeffsList={data.keygen.e_ntt.map(poly => poly.coeffs)}
          body={explanations.e.body}
        />
      </div>

      <p className="transform-ntt-step__note body-text">
        NTT converts each polynomial into a form where multiplication is fast (pointwise). Same
        polynomial, different representation.
      </p>
    </div>
  )
}

export default TransformNttStep
