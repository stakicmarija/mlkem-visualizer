import CompactVectorField from '../matrix/CompactVectorField.jsx'
import TransformBox from '../diagram-boxes/TransformBox.jsx'
import './NttColumn.css'

// Compact input block → NTT box → compact NTT-form block. Shared by KeyGen's
// s/e and Encaps' y "transform to NTT domain" steps. `showTransform=false`
// renders just a single static block (no NTT box, no "before" half) -- for
// values like decaps' ŝ that arrive already in NTT form and have nothing to
// transform on this step; `symbol`/`coeffsList`/`strong` describe that one
// block and `hatSymbol`/`nttCoeffsList` are unused.
function NttColumn({
  symbol,
  hatSymbol,
  colorToken,
  coeffsList,
  nttCoeffsList,
  body,
  strong = false,
  clickable = true,
  showTransform = true,
}) {
  if (!showTransform) {
    return (
      <div className="ntt-column">
        <CompactVectorField
          symbol={symbol}
          colorToken={colorToken}
          coeffsList={coeffsList}
          body={body}
          strong={strong}
          clickable={clickable}
        />
      </div>
    )
  }

  return (
    <div className="ntt-column">
      <CompactVectorField
        symbol={symbol}
        colorToken={colorToken}
        coeffsList={coeffsList}
        body={body}
        clickable={clickable}
      />

      <div className="ntt-column__vline" />
      <TransformBox name="NTT" explanationKey="NTT" />
      <div className="ntt-column__vline" />

      <CompactVectorField
        symbol={hatSymbol}
        colorToken={colorToken}
        coeffsList={nttCoeffsList}
        body={body}
        strong
        clickable={clickable}
      />
    </div>
  )
}

export default NttColumn
