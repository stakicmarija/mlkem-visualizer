import './VectorCell.css'

const SUB = ['₀', '₁', '₂']

// Bordered/tinted cell for one element of a sampled vector (symbol +
// subscript index, e.g. e1₀), or a single bare polynomial when `index` is
// omitted (e.g. e2 -- one value, not a vector position). Color comes from
// --vector-color/--vector-tint set on an ancestor (see SampleVectorStep,
// GenerateErrorVectorsStep) so the same cell works for s/e/y/e1/e2.
function VectorCell({ label, index, onClick }) {
  return (
    <button className="vector-cell" onClick={onClick}>
      <span className="vector-cell__label">
        <span className="vector-cell__symbol">{label}</span>
        {index !== undefined && <span className="vector-cell__index">{SUB[index]}</span>}
      </span>
    </button>
  )
}

export default VectorCell
