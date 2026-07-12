import { motion } from 'framer-motion'
import Node from './Node.jsx'
import './TunnelArrow.css'

function Arrowhead({ direction }) {
  return (
    <svg className="tunnel-arrow__head" viewBox="0 0 8 14" aria-hidden="true">
      {direction === 'forward'
        ? <path fill="currentColor" d="M0 0l8 7-8 7Z" />
        : <path fill="currentColor" d="M8 0L0 7l8 7Z" />}
    </svg>
  )
}

// Where a traveled chip rests once it arrives — near whichever end it was
// headed toward, not the middle. Also where a `compact` (already-arrived,
// non-animated) chip sits, so there's no visual jump between the two.
const REST_POSITION = { forward: '92%', backward: '8%' }
const START_POSITION = { forward: '4%', backward: '96%' }

// `compact` swaps the plain label+detail text for the same tinted leaf
// badge used for ek/dk throughout KeyGen — used once a value has actually
// been produced and is just sitting on the tunnel, not being explained.
//
// `traveling` animates that same badge sliding along the tunnel's line
// from its start to its resting position (using the actual dashed line as
// the motion path, not an arbitrary curve), firing onTravelComplete when
// it lands. Reusable for either direction — e.g. ek forward (KeyGen ->
// Encaps) today, c backward (Encaps -> Decaps) later — just by passing
// direction="backward".
function TunnelArrow({ label, detail, direction, compact, traveling, travelDuration = 0.6, onTravelComplete }) {
  const showBadgeOnTrack = compact || traveling

  return (
    <div className="tunnel-arrow">
      {direction === 'backward' && <Arrowhead direction="backward" />}
      {showBadgeOnTrack ? (
        <div className="tunnel-arrow__track">
          <div className="tunnel-arrow__line tunnel-arrow__line--full" />
          <motion.div
            className="tunnel-arrow__traveling-badge"
            initial={{ left: traveling ? START_POSITION[direction] : REST_POSITION[direction] }}
            animate={{ left: REST_POSITION[direction] }}
            transition={traveling ? { duration: travelDuration, ease: 'easeInOut' } : { duration: 0 }}
            onAnimationComplete={traveling ? onTravelComplete : undefined}
          >
            <Node label={label} variant="leaf" />
          </motion.div>
        </div>
      ) : (
        <>
          <div className="tunnel-arrow__line" />
          <span className="tunnel-arrow__chip micro-label">
            <span className="tunnel-arrow__label">{label}</span>
            {detail && <span className="tunnel-arrow__detail">{detail}</span>}
          </span>
          <div className="tunnel-arrow__line" />
        </>
      )}
      {direction === 'forward' && <Arrowhead direction="forward" />}
    </div>
  )
}

export default TunnelArrow
