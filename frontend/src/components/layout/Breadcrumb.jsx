import { useNavigate } from 'react-router-dom'
import './Breadcrumb.css'

// Full pipeline, in order. Reaching any AlgorithmPage implies every earlier
// stage is already complete (you can only get to /encaps via "ek sent", to
// /decaps via "c sent"), so each page just slices up to its own stage --
// no extra tracking needed beyond what HomePage already keeps for its own
// transitional states (keygenComplete/encapsComplete).
const STAGES = [
  { id: 'home', label: 'HOME', to: '/' },
  { id: 'keygen', label: 'KEYGEN', to: '/keygen' },
  { id: 'ek-sent', label: 'EK SENT', to: '/', state: { keygenComplete: true } },
  { id: 'encaps', label: 'ENCAPS', to: '/encaps' },
  { id: 'c-sent', label: 'C SENT', to: '/', state: { keygenComplete: true, encapsComplete: true } },
  { id: 'decaps', label: 'DECAPS', to: '/decaps' },
  { id: 'complete', label: 'COMPLETE', to: '/', state: { keygenComplete: true, encapsComplete: true, decapsComplete: true } },
]

// `stage` is the id of the current segment -- every earlier stage is shown
// as a clickable link, the current one is plain text, visually distinguished.
function Breadcrumb({ stage }) {
  const navigate = useNavigate()
  const endIndex = STAGES.findIndex(s => s.id === stage)
  const segments = STAGES.slice(0, endIndex + 1)

  return (
    <nav className="breadcrumb micro-label" aria-label="Breadcrumb">
      {segments.map((segment, i) => {
        const isCurrent = i === segments.length - 1
        return (
          <span key={segment.id} className="breadcrumb__segment">
            {i > 0 && <span className="breadcrumb__sep">{'>'}</span>}
            {isCurrent ? (
              <span className="breadcrumb__current">{segment.label}</span>
            ) : (
              <button
                type="button"
                className="breadcrumb__link"
                onClick={() => navigate(segment.to, segment.state ? { state: segment.state } : undefined)}
              >
                {segment.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
