import { useCallback, useEffect, useRef, useState } from 'react'
import DataChip from '../diagram-boxes/DataChip.jsx'
import AnimationReplayButton from '../diagram-boxes/AnimationReplayButton.jsx'
import './CbdPopupBody.css'

const ETA = 2
const GROUP_BITS = ETA * 2 // 4 bits per coefficient: 2 for x, 2 for y
const NUM_COEFFS = 5 // 20 displayed bits / 4 bits per coefficient

// Consistent pace throughout -- only 5 coefficients, so no slow-then-fast
// speedup is needed (unlike ExpandMatrixAStep's 9-cell intro).
const STEP_GAP = 1800
const FILL_DELAY = 1300

function hexToBits(hex) {
  const bits = []
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1)
  }
  return bits
}

// Flat, data-only timeline (phase + coefficient index, no closures) so it
// can be resumed from an arbitrary elapsed offset -- plain setTimeout has
// no pause/resume of its own, so Stop/Continue works by clearing pending
// timers and rescheduling whatever's left with reduced delays.
const EVENTS = Array.from({ length: NUM_COEFFS }, (_, i) => {
  const base = i * STEP_GAP
  return [
    { delay: base, phase: 'reveal', i }, // bits highlight + x/y/f appear together
    { delay: base + FILL_DELAY, phase: 'fill', i },
  ]
}).flat()

function CbdPopupBody({ prfRawHex, coeffsSigned }) {
  const bits = hexToBits(prfRawHex)
  const first20 = bits.slice(0, 20)

  // One group per coefficient: bits[4i], bits[4i+1] -> x; bits[4i+2],
  // bits[4i+3] -> y; f[i] = x - y.
  const groups = Array.from({ length: NUM_COEFFS }, (_, i) => {
    const xBits = [bits[i * GROUP_BITS], bits[i * GROUP_BITS + 1]]
    const yBits = [bits[i * GROUP_BITS + 2], bits[i * GROUP_BITS + 3]]
    const x = xBits[0] + xBits[1]
    const y = yBits[0] + yBits[1]
    return { xBits, yBits, x, y, result: x - y }
  })

  // activeCoeff (bit highlight) and revealCoeff (x/y/f values) advance
  // together, on the same tick -- the bits that move and the values that
  // appear from them happen at the same time. revealCoeff still holds the
  // previous coefficient's values right up until that tick, rather than
  // going blank in between.
  const [activeCoeff, setActiveCoeff] = useState(0)
  const [revealCoeff, setRevealCoeff] = useState(null)
  const [filledCount, setFilledCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const timeoutsRef = useRef([])
  const elapsedRef = useRef(0) // virtual ms consumed before the current run segment
  const startTimeRef = useRef(0) // performance.now() when the current run segment started

  const runEvent = useCallback(({ phase, i }) => {
    if (phase === 'reveal') {
      setActiveCoeff(i)
      setRevealCoeff(i)
    } else {
      setFilledCount(c => Math.max(c, i + 1))
    }
  }, [])

  // Schedules every event whose delay hasn't already elapsed, offset by
  // however much virtual time has already been consumed -- elapsedMs=0
  // is a fresh start; elapsedMs=elapsedRef.current resumes from a pause.
  const scheduleFrom = useCallback(elapsedMs => {
    timeoutsRef.current.forEach(clearTimeout)
    const timers = []
    startTimeRef.current = performance.now()
    EVENTS.forEach(event => {
      if (event.delay >= elapsedMs) {
        timers.push(setTimeout(() => runEvent(event), event.delay - elapsedMs))
      }
    })
    timeoutsRef.current = timers
  }, [runEvent])

  useEffect(() => {
    elapsedRef.current = 0
    scheduleFrom(0)
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [scheduleFrom])

  function handleStop() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    elapsedRef.current += performance.now() - startTimeRef.current
    setPaused(true)
  }

  function handleContinue() {
    setPaused(false)
    scheduleFrom(elapsedRef.current)
  }

  function handleReplay() {
    setActiveCoeff(0)
    setRevealCoeff(null)
    setFilledCount(0)
    setPaused(false)
    elapsedRef.current = 0
    scheduleFrom(0)
  }

  const current = groups[activeCoeff]
  const revealed = revealCoeff !== null ? groups[revealCoeff] : null
  const done = filledCount === NUM_COEFFS

  return (
    <div className="cbd-popup-body">
      <p className="body-text cbd-popup-body__formula">b = BytesToBits(B)</p>

      <div className="cbd-popup-body__strip-wrap">
        <div className="cbd-popup-body__strip">
          {first20.map((bit, i) => {
            const groupIndex = Math.floor(i / GROUP_BITS)
            const posInGroup = i % GROUP_BITS
            if (groupIndex === activeCoeff && posInGroup < ETA) {
              return <DataChip key={i} value={bit} size="sm" colorToken="cbd-x-bits" />
            }
            if (groupIndex === activeCoeff && posInGroup < GROUP_BITS) {
              return <DataChip key={i} value={bit} size="sm" colorToken="cbd-y-bits" />
            }
            return (
              <span key={i} className="cbd-popup-body__bit-dim">
                <DataChip value={bit} size="sm" tone={bit === 1 ? 'filled' : 'outline'} />
              </span>
            )
          })}
        </div>
        <p className="micro-label cbd-popup-body__strip-label">b first 20b</p>
      </div>

      <div className="cbd-popup-body__xy-section">
        <div className="cbd-popup-body__groups">
          <div className="cbd-popup-body__group">
            <p className="micro-label cbd-popup-body__group-label">x bits</p>
            <div className="cbd-popup-body__group-bits">
              <DataChip value={current.xBits[0]} size="md" colorToken="cbd-x-bits" />
              <span className="cbd-popup-body__bit-plus">+</span>
              <DataChip value={current.xBits[1]} size="md" colorToken="cbd-x-bits" />
            </div>
          </div>
          <div className="cbd-popup-body__group">
            <p className="micro-label cbd-popup-body__group-label">y bits</p>
            <div className="cbd-popup-body__group-bits">
              <DataChip value={current.yBits[0]} size="md" colorToken="cbd-y-bits" />
              <span className="cbd-popup-body__bit-plus">+</span>
              <DataChip value={current.yBits[1]} size="md" colorToken="cbd-y-bits" />
            </div>
          </div>
        </div>

        <div className="cbd-popup-body__sums">
          <span key={`x-${revealCoeff ?? 'pending'}`} className="cbd-popup-body__sum cbd-popup-body__sum--x">
            x = {revealed ? revealed.x : ''}
          </span>
          <span key={`y-${revealCoeff ?? 'pending'}`} className="cbd-popup-body__sum cbd-popup-body__sum--y">
            y = {revealed ? revealed.y : ''}
          </span>
        </div>
      </div>

      <p className="cbd-popup-body__result">
        <span key={revealCoeff ?? 'pending'} className="cbd-popup-body__result-pop">
          {revealed ? `f[${revealCoeff}] = x − y = ${revealed.result}` : 'f[0] = x − y'}
        </span>
      </p>

      <div className="cbd-popup-body__chips">
        {coeffsSigned.slice(0, NUM_COEFFS).map((coeff, i) => (
          <div key={i} className="cbd-chip">
            {i < filledCount && <span className="micro-label cbd-chip__value">{coeff}</span>}
          </div>
        ))}
      </div>

      {done ? (
        <AnimationReplayButton onClick={handleReplay} />
      ) : paused ? (
        <AnimationReplayButton onClick={handleContinue} icon="continue" label="Continue" />
      ) : (
        <AnimationReplayButton onClick={handleStop} icon="stop" label="Stop" />
      )}
    </div>
  )
}

export default CbdPopupBody
