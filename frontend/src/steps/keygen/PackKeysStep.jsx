import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import './PackKeysStep.css'

function PackKeysStep() {
  return (
    <div className="pack-keys-step">

      {/* ── Public key: t, ρ → Byte Encode(t) ‖ ρ → ekPKE ──────────────── */}
      <div className="pack-keys-step__column">
        <p className="th2 pack-keys-step__col-title">Public key</p>

        <div className="pack-keys-step__row">
          <Node label="t" />
          <Node label="ρ" />
        </div>

        {/* t drops into Byte Encode (left half); ρ passes straight down
            alongside (right half) for the same total height, so both
            branches arrive at the fan-in below at the same point. */}
        <div className="pack-keys-step__branch">
          <div className="pack-keys-step__branch-left">
            <div className="pack-keys-step__branch-lead" />
            <TransformBox name="Byte Encode" explanationKey="ByteEncode" />
          </div>
          <div className="pack-keys-step__branch-right">
            <div className="pack-keys-step__branch-line" />
          </div>
        </div>

        <svg
          className="pack-keys-step__svg"
          viewBox="0 0 240 24"
          width="240"
          height="24"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          <path d="M 60 0 V 19 Q 60 24 65 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 180 0 V 19 Q 180 24 175 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <line x1="120" y1="24" x2="120" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
        </svg>

        <div className="pack-keys-step__vline" />

        <ConcatBox />

        <div className="pack-keys-step__vline" />

        <Node label={<>ek<sub>pke</sub></>} variant="leaf" />
      </div>

      {/* ── Private key: s → Byte Encode(s) → dkPKE ────────────────────── */}
      <div className="pack-keys-step__column">
        <p className="th2 pack-keys-step__col-title">Private key</p>

        <Node label="s" />

        <div className="pack-keys-step__vline" />

        <TransformBox name="Byte Encode" explanationKey="ByteEncode" />

        <div className="pack-keys-step__vline" />

        <Node label={<>dk<sub>pke</sub></>} variant="leaf" />
      </div>
    </div>
  )
}

export default PackKeysStep
