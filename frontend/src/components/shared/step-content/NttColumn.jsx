import CompactVectorField from '../matrix/CompactVectorField.jsx'
import TransformBox from '../diagram-boxes/TransformBox.jsx'
import './NttColumn.css'

// Compact input block → NTT box → compact NTT-form block. Shared by KeyGen's
// s/e and Encaps' y "transform to NTT domain" steps.
function NttColumn({ symbol, hatSymbol, colorToken, coeffsList, nttCoeffsList, body }) {
  return (
    <div className="ntt-column">
      <CompactVectorField symbol={symbol} colorToken={colorToken} coeffsList={coeffsList} body={body} />

      <div className="ntt-column__vline" />
      <TransformBox name="NTT" explanationKey="NTT" />
      <div className="ntt-column__vline" />

      <CompactVectorField
        symbol={hatSymbol}
        colorToken={colorToken}
        coeffsList={nttCoeffsList}
        body={body}
        strong
      />
    </div>
  )
}

export default NttColumn
