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
function TransformBox({ name, subtitle, explanationKey, popupChildren, pulseKey = 0, pulseDuration = 0.6, glowing = false, resetKey = 0 }) {
  const [open, setOpen] = useState(false)
  const explanation = explanations[explanationKey]

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
        className="transform-box"
        onClick={() => setOpen(true)}
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
        <span className="transform-box__name">{name}</span>
        {subtitle && (
          <span className="transform-box__subtitle">{subtitle}</span>
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
