import './CompareBox.css'

// Dark, non-interactive "=?" box, same visual weight as ConcatBox -- used
// where two values are compared instead of joined (Decaps' c vs c' check).
function CompareBox() {
  return <div className="compare-box">=?</div>
}

export default CompareBox
