import { useCallback, useEffect, useRef, useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import DataChip from '../../components/shared/diagram-boxes/DataChip.jsx'
import ModQRing from '../../components/shared/mod-q-ring/ModQRing.jsx'
import AnimationReplayButton from '../../components/shared/diagram-boxes/AnimationReplayButton.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import data from '../../data/mlkem_768_data.json'
import './EncodePlaintextStep.css'

const { q } = data.params
const BIT_PREVIEW_COUNT = 8 // matches the "m first 8b" walkthrough strip

// Consistent pace throughout -- only 8 bits, so no slow-then-fast speedup
// is needed (same reasoning as CbdPopupBody's 5 coefficients).
const STEP_GAP = 1400

function hexToBits(hex) {
  const bits = []
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1)
  }
  return bits
}

// ByteDecode₁(m) just unpacks m's bytes into individual bits (LSB-first,
// per FIPS 203's BytesToBits) -- these are its real output, not a stand-in.
const previewBits = hexToBits(data.inputs.m).slice(0, BIT_PREVIEW_COUNT)
// μ's real coefficients already are Decompress₁(bit) for each bit above --
// reuse them instead of recomputing the 0/1665 mapping.
const previewValues = data.encaps.mu.coeffs.slice(0, BIT_PREVIEW_COUNT)

// Flat, data-only timeline (bit index, no closures) so it can be resumed
// from an arbitrary elapsed offset -- same Stop/Continue mechanism as
// CbdPopupBody: clear pending timers, reschedule what's left with reduced
// delays. One event per bit -- highlight and chip fill land on the same
// tick, unlike CbdPopupBody's separate reveal/fill phases.
const EVENTS = Array.from({ length: BIT_PREVIEW_COUNT }, (_, i) => ({ delay: i * STEP_GAP, i }))

function EncodePlaintextStep() {
  const [muOpen, setMuOpen] = useState(false)
  const [mOpen, setMOpen] = useState(false)

  const [activeBit, setActiveBit] = useState(0)
  const [filledCount, setFilledCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const timeoutsRef = useRef([])
  const elapsedRef = useRef(0) // virtual ms consumed before the current run segment
  const startTimeRef = useRef(0) // performance.now() when the current run segment started

  const runEvent = useCallback(({ i }) => {
    setActiveBit(i)
    setFilledCount(c => Math.max(c, i + 1))
  }, [])

  // Schedules every event whose delay hasn't already elapsed, offset by
  // however much virtual time has already been consumed -- elapsedMs=0 is
  // a fresh start; elapsedMs=elapsedRef.current resumes from a pause.
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
    setActiveBit(0)
    setFilledCount(0)
    setPaused(false)
    elapsedRef.current = 0
    scheduleFrom(0)
  }

  const activeBitValue = previewBits[activeBit]
  const done = filledCount === BIT_PREVIEW_COUNT

  return (
    <div className="encode-plaintext-step">
      <Node label="m" microLabel="BYTES" className="encode-plaintext-step__node--sm" onClick={() => setMOpen(true)} />

      <div className="encode-plaintext-step__vline" />

      <TransformBox name="Byte Decode" explanationKey="ByteDecode1" />

      <div className="encode-plaintext-step__vline" />

      <Node label="m" microLabel="bits" className="encode-plaintext-step__node--sm" onClick={() => setMOpen(true)} />

      <div className="encode-plaintext-step__vline" />

      <div className="encode-plaintext-step__panel">
        <div className="encode-plaintext-step__panel-header">
          <p className="encode-plaintext-step__panel-title">Decompress</p>
          <p className="body-text">y = &#8968;(q/2&#7496;) &middot; y&#8969;, d = 1</p>
        </div>

        <div className="encode-plaintext-step__strip-wrap">
          <div className="encode-plaintext-step__strip">
            {previewBits.map((bit, i) => (
              <DataChip
                key={i}
                value={bit}
                size="sm"
                tone={bit === 1 ? 'filled' : 'outline'}
                colorToken={i === activeBit ? 'encoded-message' : undefined}
              />
            ))}
          </div>
          <span className="micro-label encode-plaintext-step__strip-label">m first {BIT_PREVIEW_COUNT}b</span>
        </div>

        <ModQRing
          q={q}
          size={92}
          compact
          tickLabels={false}
          anchors={[
            { angle: 0, label: '0', colorToken: activeBitValue === 0 ? 'encoded-message' : 'transform' },
            { angle: 180, label: '1665', colorToken: activeBitValue === 1 ? 'encoded-message' : 'transform' },
          ]}
        />

        <p className="label encode-plaintext-step__mapping">
          {previewBits[activeBit]} &rarr; {previewValues[activeBit]}
        </p>

        <div className="encode-plaintext-step__output-row">
          {previewValues.map((value, i) => (
            <DataChip
              key={i}
              value={i < filledCount ? value : ''}
              size="auto"
              tone={i === activeBit ? 'outline-accent' : 'outline'}
              colorToken={i === activeBit ? 'encoded-message' : undefined}
            />
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

      <div className="encode-plaintext-step__vline" />

      <Node label="μ" variant="leaf" onClick={() => setMuOpen(true)} />

      <Popup
        title="μ"
        body={explanations.mu.body}
        polynomialPreview={formatPolynomialPreview('μ', data.encaps.mu.coeffs)}
        fullCoefficients={data.encaps.mu.coeffs}
        isOpen={muOpen}
        onClose={() => setMuOpen(false)}
      />

      <Popup
        title="m (32B seed)"
        body={explanations.m.body}
        value={toSpacedHex(data.inputs.m)}
        isOpen={mOpen}
        onClose={() => setMOpen(false)}
      />
    </div>
  )
}

export default EncodePlaintextStep
