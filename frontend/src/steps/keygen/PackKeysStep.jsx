import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './PackKeysStep.css'

const SUB = ['₀', '₁', '₂']

function PackKeysStep() {
  const [rhoOpen, setRhoOpen] = useState(false)
  const [ekPkeOpen, setEkPkeOpen] = useState(false)
  const [dkPkeOpen, setDkPkeOpen] = useState(false)
  const tPopup = useCellPopup(data.keygen.t.length)
  const sPopup = useCellPopup(data.keygen.s.length)
  const tLabel = tPopup.index !== null ? `t${SUB[tPopup.index]}` : null
  const sLabel = sPopup.index !== null ? `s${SUB[sPopup.index]}` : null

  return (
    <div className="pack-keys-step">

      {/* ── Public key: t, ρ → Byte Encode(t) ‖ ρ → ekPKE ──────────────── */}
      <div className="pack-keys-step__column">
        <p className="th2 pack-keys-step__col-title">Public key</p>

        <div className="pack-keys-step__row">
          <Node label="t" onClick={() => tPopup.open(0)} />
          <Node label="ρ" onClick={() => setRhoOpen(true)} />
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

        <Node label={<>ek<sub>pke</sub></>} variant="leaf" onClick={() => setEkPkeOpen(true)} />
      </div>

      {/* ── Private key: s → Byte Encode(s) → dkPKE ────────────────────── */}
      <div className="pack-keys-step__column">
        <p className="th2 pack-keys-step__col-title">Private key</p>

        <Node label="s" onClick={() => sPopup.open(0)} />

        <div className="pack-keys-step__vline" />

        <TransformBox name="Byte Encode" explanationKey="ByteEncode" />

        <div className="pack-keys-step__vline" />

        <Node label={<>dk<sub>pke</sub></>} variant="leaf" onClick={() => setDkPkeOpen(true)} />
      </div>

      <Popup
        title={explanations.rho.title}
        body={explanations.rho.body}
        value={toSpacedHex(data.keygen.rho)}
        isOpen={rhoOpen}
        onClose={() => setRhoOpen(false)}
      />
      <Popup
        title={<>ek<sub>pke</sub> (K-PKE encapsulation key)</>}
        body={explanations.ekPke.body}
        value={truncateHex(data.keygen.ek_pke)}
        fullValue={toSpacedHex(data.keygen.ek_pke)}
        isOpen={ekPkeOpen}
        onClose={() => setEkPkeOpen(false)}
      />
      <Popup
        title={<>dk<sub>pke</sub> (K-PKE decapsulation key)</>}
        body={explanations.dkPke.body}
        value={truncateHex(data.keygen.dk_pke)}
        fullValue={toSpacedHex(data.keygen.dk_pke)}
        isOpen={dkPkeOpen}
        onClose={() => setDkPkeOpen(false)}
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
      {sPopup.isOpen && (
        <Popup
          title={sLabel}
          body={explanations.s.body}
          polynomialPreview={formatPolynomialPreview(sLabel, data.keygen.s[sPopup.index].coeffs_signed)}
          fullCoefficients={data.keygen.s[sPopup.index].coeffs_signed}
          onPrev={sPopup.goPrev}
          onNext={sPopup.goNext}
          hasPrev={sPopup.hasPrev}
          hasNext={sPopup.hasNext}
          isOpen
          onClose={sPopup.close}
        />
      )}
    </div>
  )
}

export default PackKeysStep
