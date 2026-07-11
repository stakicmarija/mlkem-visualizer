import './ConcatBox.css'

// Dark, non-interactive "‖" (concatenation) box used wherever two byte
// strings are joined -- e.g. ρ‖σ in Derive ρ and σ, ByteEncode(t)‖ρ in Pack keys.
function ConcatBox() {
  return <div className="concat-box">||</div>
}

export default ConcatBox
