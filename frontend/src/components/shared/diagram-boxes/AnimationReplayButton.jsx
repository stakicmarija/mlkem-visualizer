import './AnimationReplayButton.css'

// SVGs (not text glyphs) so each icon centers on the label by its own
// fixed box, same convention as Button.jsx's icons and TransformBox's
// PlayIcon -- a glyph's font metrics don't reliably line up with the
// sibling text's line box.
function ReplayIcon() {
  return (
    <svg className="animation-replay-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg className="animation-replay-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" fill="currentColor" />
    </svg>
  )
}

function ContinueIcon() {
  return (
    <svg className="animation-replay-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  )
}

const ICONS = { replay: ReplayIcon, stop: StopIcon, continue: ContinueIcon }

// Reusable icon+label affordance for animation controls that share one
// look -- defaults to "Replay" (ExpandMatrixAStep's intro sequence,
// CbdPopupBody's per-coefficient walk once finished); pass icon="stop" /
// icon="continue" to reuse the same style mid-animation.
function AnimationReplayButton({ onClick, icon = 'replay', label = 'Replay' }) {
  const Icon = ICONS[icon]
  return (
    <button className="animation-replay-btn" onClick={onClick}>
      <Icon />
      <span className="micro-label">{label}</span>
    </button>
  )
}

export default AnimationReplayButton
