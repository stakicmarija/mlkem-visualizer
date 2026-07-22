import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './DeriveKRStep.css'

// Same underlying values as the EncapsPage INPUT panel's m/ek entries and
// the K/r rows in GENERATED VALUES -- reuses their exact popup content.
const ITEMS = {
  m: { title: 'm (32B seed)', body: explanations.m.body, value: toSpacedHex(data.inputs.m) },
  ek: { title: 'ek (public key)', body: explanations.ek.body, value: truncateHex(data.keygen.ek), fullValue: toSpacedHex(data.keygen.ek) },
  K: { title: explanations.K.title, body: explanations.K.body, value: toSpacedHex(data.encaps.K) },
  r: { title: explanations.r.title, body: explanations.r.body, value: toSpacedHex(data.encaps.r) },
}

// Two lanes (x=60 for m, x=180 for ek), matching DeriveRhoSigmaStep's
// 240px coordinate system. ek drops into H first; m bypasses straight down
// alongside it -- same "raw bypass" idea as BuildDkStep's ek lane -- and the
// two rejoin at the concat box before going into G.
function DeriveKRStep() {
  const [openKey, setOpenKey] = useState(null)
  const active = openKey && ITEMS[openKey]

  return (
    <div className="derive-k-r">
      <div className="derive-k-r__row">
        <div className="derive-k-r__lane">
          <Node label="m" onClick={() => setOpenKey('m')} />
        </div>
        <div className="derive-k-r__lane">
          <Node label="ek" onClick={() => setOpenKey('ek')} />
        </div>
      </div>

      <div className="derive-k-r__connector">
        <div className="derive-k-r__lane">
          <div className="derive-k-r__vline" />
        </div>
        <div className="derive-k-r__lane">
          <div className="derive-k-r__vline" />
        </div>
      </div>

      <div className="derive-k-r__branch">
        <div className="derive-k-r__lane">
          <div className="derive-k-r__branch-line" />
        </div>
        <div className="derive-k-r__lane">
          <TransformBox name="H" subtitle="SHA3-256" explanationKey="H" />
        </div>
      </div>

      <svg
        className="derive-k-r__svg"
        viewBox="0 0 240 48"
        width="240"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <path d="M 60 0 V 19 Q 60 24 65 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 180 0 V 19 Q 180 24 175 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <line x1="120" y1="24" x2="120" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <ConcatBox />

      <div className="derive-k-r__vline" />

      <TransformBox name="G" subtitle="SHA3-512" explanationKey="G" />

      <svg
        className="derive-k-r__svg"
        viewBox="0 0 240 48"
        width="240"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <line x1="120" y1="0" x2="120" y2="24" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 120 24 H 65 Q 60 24 60 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 120 24 H 175 Q 180 24 180 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="derive-k-r__row">
        <div className="derive-k-r__lane">
          <Node label="K" variant="leaf" onClick={() => setOpenKey('K')} />
        </div>
        <div className="derive-k-r__lane">
          <Node label="r" variant="leaf" onClick={() => setOpenKey('r')} />
        </div>
      </div>

      {active && (
        <Popup
          title={active.title}
          body={active.body}
          value={active.value}
          fullValue={active.fullValue}
          isOpen
          onClose={() => setOpenKey(null)}
        />
      )}
    </div>
  )
}

export default DeriveKRStep
