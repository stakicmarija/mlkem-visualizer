import { useCallback, useEffect, useRef, useState } from 'react'
import Node from '../diagram-boxes/Node.jsx'
import MatrixCell from '../matrix/MatrixCell.jsx'
import RhoIJColumn from '../diagram-boxes/RhoIJColumn.jsx'
import TransformBox from '../diagram-boxes/TransformBox.jsx'
import AnimationReplayButton from '../diagram-boxes/AnimationReplayButton.jsx'
import './MatrixAAnimation.css'

const SUB = ['₀', '₁', '₂']

// Container width (320px) split into 3 equal grid columns with 16px gaps:
// each column is (320-32)/3 = 96px, centers at 48, 160, 272
const W = 320
const CX = [48, 160, 272]

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

const CELL_COUNT = 9

// Shared "ρ → SampleNTT → 3×3 matrix A" animated diagram -- ρ fans out into
// three ρ‖j‖i columns, through SampleNTT, filling the matrix grid one cell
// at a time (narrated for the first row, then a fast fade-in for the rest).
// Used identically by KeyGen's ExpandMatrixAStep (A generated for the first
// time) and Encaps' RegenerateMatrixAStep (Bob regenerates the same A from
// the same ρ) -- same layout and animation; only the ρ popup content and
// the cell coefficients underneath differ, both supplied by the caller.
function MatrixAAnimation({ onRhoClick, onCellClick }) {
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
    <>
      <Node label="ρ" onClick={onRhoClick} />

      {/* Fan-out: ρ → three columns */}
      <svg
        className="matrix-a-animation__svg"
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

      <div className="matrix-a-animation__columns">
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
        className="matrix-a-animation__svg"
        viewBox={`0 0 ${W} 24`}
        width={W}
        height="24"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* col0: drop, rounded turn right, extend to center */}
        <path
          className={`matrix-a-animation__fanin-path${activeLine === 0 ? ' matrix-a-animation__fanin-path--active' : ''}`}
          d={`M ${CX[0]} 0 V ${12-5} Q ${CX[0]} 12 ${CX[0]+5} 12 H ${CX[1]}`}
        />
        {/* col1: straight drop all the way through */}
        <line
          className={`matrix-a-animation__fanin-path${activeLine === 1 ? ' matrix-a-animation__fanin-path--active' : ''}`}
          x1={CX[1]} y1="0" x2={CX[1]} y2="24"
        />
        {/* col2: drop, rounded turn left, extend to center */}
        <path
          className={`matrix-a-animation__fanin-path${activeLine === 2 ? ' matrix-a-animation__fanin-path--active' : ''}`}
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

      <div className={`matrix-a-animation__vline${activeLine !== null ? ' matrix-a-animation__vline--active' : ''}`} />

      <div className={`matrix-a-animation__grid${fastPhaseActive ? ' matrix-a-animation__grid--fast' : ''}`}>
        {[0, 1, 2].map(i => (
          <div key={i} className="matrix-a-animation__grid-row">
            {[0, 1, 2].map(j => (
              <MatrixCell
                key={j}
                label={`A${SUB[i]}${SUB[j]}`}
                state={cellState(i, j)}
                onClick={() => onCellClick(i * 3 + j)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="matrix-a-animation__progress micro-label">
        <span>{doneKeys.size} / {CELL_COUNT}</span>
        <div className="matrix-a-animation__progress-bar">
          <div
            className="matrix-a-animation__progress-fill"
            style={{ width: `${(doneKeys.size / CELL_COUNT) * 100}%` }}
          />
        </div>
      </div>

      {doneKeys.size === CELL_COUNT && (
        <AnimationReplayButton onClick={handleReplay} />
      )}
    </>
  )
}

export default MatrixAAnimation
