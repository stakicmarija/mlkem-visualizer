import { useState } from 'react'
import { motion } from 'framer-motion'
import Popup from '../popup/Popup.jsx'
import { explanations } from '../../../data/explanations.js'
import './TransformBox.css'

const PULSE_GLOW = [
  '0 0 0px 0px var(--color-accent-glow)',
  '0 0 16px 4px var(--color-accent-glow)',
  '0 0 0px 0px var(--color-accent-glow)',
]

// SVG (not a text glyph) so it centers on the name text by its own fixed
// box, same convention as Button.jsx's icons -- a glyph's font metrics
// don't reliably line up with the sibling text's line box.
function PlayIcon() {
  return (
    <svg className="transform-box__play-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="var(--color-button-text)" d="M8 5v14l11-7z" />
    </svg>
  )
}

// pulseKey: bump it to replay a brief glow pulse (used to mark "this
// transform just ran" during a step's intro animation). Remounting the
// button on each bump is what makes the keyframe sequence replay.
// pulseDuration: shorten it (e.g. for a fast-forwarded batch of pulses)
// without changing the keyframes themselves.
// glowing: hold a sustained peak glow instead of a discrete pulse (e.g.
// for a whole fast-forwarded batch, rather than re-pulsing per item).
// Once true, the button switches into glow mode for good -- pulseKey is
// ignored from then on, so easing back to rest when glowing clears again
// is a plain tween, not another remounted pulse cycle.
// resetKey: bump it (alongside resetting pulseKey/glowing) to start a
// completely fresh run -- e.g. a step's "replay" button -- so the
// glow-mode latch from a previous run doesn't swallow the new run's
// discrete slow-phase pulses.
// hasAnimation: marks this box's popup as containing an animation rather
// than static text -- shows a small play-icon badge (permanent, a general
// "this one's interactive" convention) and, while `seen` is false, a
// constant (non-pulsing) glow inviting the first click. `seen`/`onOpen`
// are the caller's own "has this specific box been opened before" state:
// it must live above the step's own remount boundary (steps remount on
// every navigation), so TransformBox only reads/reports it, never owns it.
function TransformBox({
  name, subtitle, explanationKey, popupChildren,
  pulseKey = 0, pulseDuration = 0.6, glowing = false, resetKey = 0,
  hasAnimation = false, seen = false, onOpen,
}) {
  const [open, setOpen] = useState(false)
  const explanation = explanations[explanationKey]
  const showIdleGlow = hasAnimation && !seen && !open

  function handleClick() {
    setOpen(true)
    onOpen?.()
  }

  // Latch "has glowing turned on this run" during render (React's
  // documented adjust-state-from-props pattern) so the eventual glowing ->
  // false edge eases down from the held peak instead of remounting into
  // pulseKey's discrete-replay branch. resetKey changing clears the latch
  // for a brand new run.
  const [prevGlowing, setPrevGlowing] = useState(glowing)
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  const [enteredGlow, setEnteredGlow] = useState(glowing)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setPrevGlowing(glowing)
    setEnteredGlow(glowing)
  } else if (glowing !== prevGlowing) {
    setPrevGlowing(glowing)
    if (glowing) setEnteredGlow(true)
  }
  const inGlowMode = enteredGlow

  return (
    <>
      <motion.button
        key={inGlowMode ? 'glow' : pulseKey}
        className={`transform-box${showIdleGlow ? ' transform-box--idle-glow' : ''}`}
        onClick={handleClick}
        initial={
          inGlowMode || pulseKey > 0
            ? { boxShadow: PULSE_GLOW[0], scale: 1 }
            : false
        }
        animate={
          inGlowMode
            ? { boxShadow: glowing ? PULSE_GLOW[1] : PULSE_GLOW[0], scale: glowing ? 1.06 : 1 }
            : pulseKey > 0
              ? { boxShadow: PULSE_GLOW, scale: [1, 1.06, 1] }
              : undefined
        }
        transition={{ duration: inGlowMode ? 0.25 : pulseDuration, ease: 'easeInOut' }}
      >
        <span className="transform-box__name-row">
          <span className="transform-box__name">{name}</span>
          {hasAnimation && <PlayIcon />}
        </span>
        {subtitle && (
          <span className="transform-box__subtitle">{subtitle}</span>
        )}
        {hasAnimation && !seen && !open && (
          <span className="transform-box__subtitle transform-box__hint">click to animate</span>
        )}
      </motion.button>

      {open && (explanation || popupChildren) && (
        <Popup
          title={explanation?.title ?? name}
          body={popupChildren ? undefined : explanation?.body}
          isOpen
          onClose={() => setOpen(false)}
        >
          {popupChildren}
        </Popup>
      )}
    </>
  )
}

export default TransformBox
