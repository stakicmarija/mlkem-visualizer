import './FormulaBox.css'

function FormulaBox({ children }) {
  return (
    <div className="formula-box">
      <p className="formula formula-box__text">{children}</p>
    </div>
  )
}

export default FormulaBox
