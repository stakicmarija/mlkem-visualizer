import { useCallback, useEffect, useRef, useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import MatrixCell from '../../components/shared/matrix/MatrixCell.jsx'
import RhoIJColumn from '../../components/shared/diagram-boxes/RhoIJColumn.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './ExpandMatrixAStep.css'

const SUB = ['₀', '₁', '₂']

// Container width (320px) split into 3 equal grid columns with 16px gaps:
// each column is (320-32)/3 = 96px, centers at 48, 160, 272
const W = 320
const CX = [48, 160, 272]

// Flat list of A's 9 cells, in row-major order — index i*3+j — so prev/next
// navigation in the popup can walk straight through this array.
const CELLS = [0, 1, 2].flatMap(i =>
  [0, 1, 2].map(j => ({
    label: `A${SUB[i]}${SUB[j]}`,
    coeffs: data.keygen.A[i][j].coeffs,
  }))
)

// Intro animation: narrate the first row in full (box glow -> line highlight
// -> SampleNTT pulse -> cell fill), one index per STEP_GAP. All 3 share
// column i=0, so the same RhoIJColumn and fan-in path stay lit across the
// whole sequence. The remaining 6 cells then run the same box/line/pulse/
// fill cycle, just heavily compressed, so generation still visibly
// continues instead of snapping straight to the final state.
const ANIMATED_SEQUENCE = [{ i: 0, j: 0 }, { i: 0, j: 1 }, { i: 0, j: 2 }]
const REMAINING_SEQUENCE = [0, 1, 2]
  .flatMap(i => [0, 1, 2].map(j => ({ i, j })))
  .filter(({ i, j }) => !ANIMATED_SEQUENCE.some(a => a.i === i && a.j === j))

const STEP_GAP = 2000
const SLOW_PULSE_DURATION = 0.6

const FAST_STEP_GAP = 220
const FAST_FILL_DELAY = 180

function ExpandMatrixAStep() {
  const popup = useCellPopup(CELLS.length)
  const cell = popup.index !== null ? CELLS[popup.index] : null

  const [activeIndex, setActiveIndex] = useState(null)
  const [activeLine, setActiveLine] = useState(null)
  const [pulseKey, setPulseKey] = useState(0)
  const [doneKeys, setDoneKeys] = useState(() => new Set())
  const [fastPhaseActive, setFastPhaseActive] = useState(false)
  const [transformGlowing, setTransformGlowing] = useState(false)
  const [runId, setRunId] = useState(0)
  const timeoutsRef = useRef([])

  // Schedules the full intro sequence's timeouts. Assumes state is already
  // at its clean-slate values -- pure scheduling, no synchronous setState,
  // so it's safe to call directly from the mount effect below.
  const scheduleTimeline = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    const timers = []
    timeoutsRef.current = timers

    ANIMATED_SEQUENCE.forEach(({ i, j }, k) => {
      const base = k * STEP_GAP
      timers.push(setTimeout(() => setActiveIndex({ i, j }), base))
      timers.push(setTimeout(() => setActiveLine(i), base + 450))
      timers.push(setTimeout(() => setPulseKey(p => p + 1), base + 900))
      timers.push(setTimeout(() => {
        setDoneKeys(prev => new Set(prev).add(`${i}-${j}`))
        setActiveIndex(null)
        setActiveLine(null)
      }, base + 1500))
    })

    const slowEnd = (ANIMATED_SEQUENCE.length - 1) * STEP_GAP + 1500
    const fastStart = slowEnd + 500

    timers.push(setTimeout(() => {
      setFastPhaseActive(true)
      setTransformGlowing(true)
    }, fastStart))

    REMAINING_SEQUENCE.forEach(({ i, j }, k) => {
      const base = fastStart + k * FAST_STEP_GAP
      timers.push(setTimeout(() => {
        setActiveIndex({ i, j })
        setActiveLine(i)
      }, base))
      timers.push(setTimeout(() => {
        setDoneKeys(prev => new Set(prev).add(`${i}-${j}`))
        setActiveIndex(null)
        setActiveLine(null)
      }, base + FAST_FILL_DELAY))
    })

    const fastEnd = fastStart + (REMAINING_SEQUENCE.length - 1) * FAST_STEP_GAP + FAST_FILL_DELAY
    timers.push(setTimeout(() => {
      setFastPhaseActive(false)
      setTransformGlowing(false)
    }, fastEnd))
  }, [])

  useEffect(() => {
    scheduleTimeline()
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [scheduleTimeline])

  // Resets to a clean slate and reschedules -- runId bumps so
  // TransformBox's own glow-mode latch resets too, not just this
  // component's state.
  function handleReplay() {
    setRunId(id => id + 1)
    setActiveIndex(null)
    setActiveLine(null)
    setPulseKey(0)
    setDoneKeys(new Set())
    setFastPhaseActive(false)
    setTransformGlowing(false)
    scheduleTimeline()
  }

  function cellState(i, j) {
    const key = `${i}-${j}`
    if (doneKeys.has(key)) return 'done'
    if (activeIndex?.i === i && activeIndex?.j === j) return 'active'
    return 'pending'
  }

  return (
    <div className="expand-matrix-a">
      <Node label="ρ" />

      {/* Fan-out: ρ → three columns */}
      <svg
        className="expand-matrix-a__svg"
        viewBox={`0 0 ${W} 24`}
        width={W}
        height="24"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* center drop passes straight through the crossbar */}
        <line x1={CX[1]} y1="0" x2={CX[1]} y2="24" stroke="var(--color-transform)" strokeWidth="3" />
        {/* left branch: from center, go left to corner, rounded turn, drop to col0 */}
        <path d={`M ${CX[1]} 12 H ${CX[0]+5} Q ${CX[0]} 12 ${CX[0]} 17 V 24`} fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        {/* right branch: from center, go right to corner, rounded turn, drop to col2 */}
        <path d={`M ${CX[1]} 12 H ${CX[2]-5} Q ${CX[2]} 12 ${CX[2]} 17 V 24`} fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="expand-matrix-a__columns">
        {[0, 1, 2].map(i => (
          <RhoIJColumn
            key={i}
            i={i}
            activeJ={activeIndex?.i === i ? activeIndex.j : null}
          />
        ))}
      </div>

      {/* Fan-in: three columns → SampleNTT */}
      <svg
        className="expand-matrix-a__svg"
        viewBox={`0 0 ${W} 24`}
        width={W}
        height="24"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* col0: drop, rounded turn right, extend to center */}
        <path
          className={`expand-matrix-a__fanin-path${activeLine === 0 ? ' expand-matrix-a__fanin-path--active' : ''}`}
          d={`M ${CX[0]} 0 V ${12-5} Q ${CX[0]} 12 ${CX[0]+5} 12 H ${CX[1]}`}
        />
        {/* col1: straight drop all the way through */}
        <line
          className={`expand-matrix-a__fanin-path${activeLine === 1 ? ' expand-matrix-a__fanin-path--active' : ''}`}
          x1={CX[1]} y1="0" x2={CX[1]} y2="24"
        />
        {/* col2: drop, rounded turn left, extend to center */}
        <path
          className={`expand-matrix-a__fanin-path${activeLine === 2 ? ' expand-matrix-a__fanin-path--active' : ''}`}
          d={`M ${CX[2]} 0 V ${12-5} Q ${CX[2]} 12 ${CX[2]-5} 12 H ${CX[1]}`}
        />
      </svg>

      <TransformBox
        name="SampleNTT"
        explanationKey="SampleNTT"
        pulseKey={pulseKey}
        pulseDuration={SLOW_PULSE_DURATION}
        glowing={transformGlowing}
        resetKey={runId}
      />

      <div className={`expand-matrix-a__vline${activeLine !== null ? ' expand-matrix-a__vline--active' : ''}`} />

      <div className={`matrix-a-grid${fastPhaseActive ? ' matrix-a-grid--fast' : ''}`}>
        {[0, 1, 2].map(i => (
          <div key={i} className="matrix-a-grid__row">
            {[0, 1, 2].map(j => (
              <MatrixCell
                key={j}
                label={`A${SUB[i]}${SUB[j]}`}
                state={cellState(i, j)}
                onClick={() => popup.open(i * 3 + j)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="expand-matrix-a__progress micro-label">
        <span>{doneKeys.size} / {CELLS.length}</span>
        <div className="expand-matrix-a__progress-bar">
          <div
            className="expand-matrix-a__progress-fill"
            style={{ width: `${(doneKeys.size / CELLS.length) * 100}%` }}
          />
        </div>
      </div>

      {doneKeys.size === CELLS.length && (
        <button className="expand-matrix-a__replay-btn" onClick={handleReplay}>
          <span className="expand-matrix-a__replay-icon" aria-hidden="true">↻</span>
          <span className="micro-label">Replay</span>
        </button>
      )}

      {cell && (
        <Popup
          title={cell.label}
          body={explanations.A.body}
          polynomialPreview={formatPolynomialPreview(cell.label, cell.coeffs)}
          fullCoefficients={cell.coeffs}
          onPrev={popup.goPrev}
          onNext={popup.goNext}
          hasPrev={popup.hasPrev}
          hasNext={popup.hasNext}
          isOpen
          onClose={popup.close}
        />
      )}
    </div>
  )
}

export default ExpandMatrixAStep
