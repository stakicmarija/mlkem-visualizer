import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './DecodePublicKeyStep.css'

const SUB = ['₀', '₁', '₂']

// ekPKE splits into two slices: [0:384k] decodes into t̂ via ByteDecode;
// [384k:384k+32] is copied straight through as ρ, no transform needed. The
// two branches never rejoin -- same two-independent-columns idea as
// BuildDkStep's Public/Private key columns.
function DecodePublicKeyStep() {
  const [rhoOpen, setRhoOpen] = useState(false)
  const tPopup = useCellPopup(data.keygen.t.length)
  const tLabel = tPopup.index !== null ? `t̂${SUB[tPopup.index]}` : null

  return (
    <div className="decode-public-key">
      <Node label={<>ek<sub>pke</sub></>} microLabel="(384k + 32)B" />

      <svg
        className="decode-public-key__svg"
        viewBox="0 0 360 48"
        width="360"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <line x1="180" y1="0" x2="180" y2="24" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 180 24 H 95 Q 90 24 90 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 180 24 H 265 Q 270 24 270 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="decode-public-key__row">
        <div className="decode-public-key__lane">
          <Node label={<>ek<sub>pke</sub></>} microLabel="[0 : 384k]B" />
        </div>
        <div className="decode-public-key__lane">
          <Node label={<>ek<sub>pke</sub></>} microLabel="[384k : 384k+32]B" />
        </div>
      </div>

      <div className="decode-public-key__columns">
        <div className="decode-public-key__column">
          <div className="decode-public-key__vline" />
          <TransformBox name="Byte Decode" explanationKey="ByteDecode" />
          <div className="decode-public-key__vline" />
          <Node label="t̂" variant="leaf" onClick={() => tPopup.open(0)} />
        </div>
        <div className="decode-public-key__column">
          <div className="decode-public-key__vline" />
          <Node label="ρ" variant="leaf" onClick={() => setRhoOpen(true)} />
        </div>
      </div>

      <Popup
        title={explanations.rho.title}
        body={explanations.rho.body}
        value={toSpacedHex(data.encaps.decoded_rho)}
        isOpen={rhoOpen}
        onClose={() => setRhoOpen(false)}
      />

      {tPopup.isOpen && (
        <Popup
          title={tLabel}
          body={explanations.t.body}
          polynomialPreview={formatPolynomialPreview(tLabel, data.keygen.t[tPopup.index].coeffs)}
          fullCoefficients={data.keygen.t[tPopup.index].coeffs}
          onPrev={tPopup.goPrev}
          onNext={tPopup.goNext}
          hasPrev={tPopup.hasPrev}
          hasNext={tPopup.hasNext}
          isOpen
          onClose={tPopup.close}
        />
      )}
    </div>
  )
}

export default DecodePublicKeyStep
