import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './BuildDkStep.css'

const ITEMS = {
  ekPke: {
    title: <>ek<sub>pke</sub> (K-PKE encapsulation key)</>,
    body: explanations.ekPke.body,
    value: truncateHex(data.keygen.ek_pke),
    fullValue: toSpacedHex(data.keygen.ek_pke),
  },
  ek: { title: explanations.ek.title, body: explanations.ek.body, value: truncateHex(data.keygen.ek), fullValue: toSpacedHex(data.keygen.ek) },
  dkPke: {
    title: <>dk<sub>pke</sub> (K-PKE decapsulation key)</>,
    body: explanations.dkPke.body,
    value: truncateHex(data.keygen.dk_pke),
    fullValue: toSpacedHex(data.keygen.dk_pke),
  },
  z: { title: explanations.z.title, body: explanations.z.body, value: toSpacedHex(data.inputs.z) },
  dk: { title: explanations.dk.title, body: explanations.dk.body, value: truncateHex(data.keygen.dk), fullValue: toSpacedHex(data.keygen.dk) },
}

function BuildDkStep() {
  const [openKey, setOpenKey] = useState(null)
  const active = openKey && ITEMS[openKey]

  return (
    <div className="build-dk-step">

      {/* ── Public key: ekPKE → ek (direct copy, no transform) ─────────── */}
      <div className="build-dk-step__column">
        <p className="th2 build-dk-step__col-title">Public key</p>

        <Node label={<>ek<sub>pke</sub></>} onClick={() => setOpenKey('ekPke')} />

        <div className="build-dk-step__vline" />

        <Node label="ek" variant="leaf" onClick={() => setOpenKey('ek')} />
      </div>

      {/* ── Private key: dkPKE, ek (raw + through H), z → dk ───────────── */}
      <div className="build-dk-step__column">
        <p className="th2 build-dk-step__col-title">Private key</p>

        {/* Four lanes at x=60/180/300/420: dkPKE, ek, (empty — ek's raw
            bypass appears here below), z */}
        <div className="build-dk-step__row">
          <div className="build-dk-step__row-quarter"><Node label={<>dk<sub>pke</sub></>} onClick={() => setOpenKey('dkPke')} /></div>
          <div className="build-dk-step__row-quarter"><Node label="ek" onClick={() => setOpenKey('ek')} /></div>
          <div className="build-dk-step__row-quarter" />
          <div className="build-dk-step__row-quarter"><Node label="z" onClick={() => setOpenKey('z')} /></div>
        </div>

        {/* ek splits into two: one line into H, one raw bypass line that
            skips H entirely, both eventually reaching the concat below. */}
        <svg
          className="build-dk-step__svg"
          viewBox="0 0 480 48"
          width="480"
          height="48"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          <line x1="60" y1="0" x2="60" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
          <line x1="180" y1="0" x2="180" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 180 0 V 19 Q 180 24 185 24 H 295 Q 300 24 300 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <line x1="420" y1="0" x2="420" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
        </svg>

        <div className="build-dk-step__branch">
          <div className="build-dk-step__row-quarter">
            <div className="build-dk-step__branch-line" />
          </div>
          <div className="build-dk-step__row-quarter">
            <TransformBox name="H" subtitle="SHA3-256" explanationKey="H" />
          </div>
          <div className="build-dk-step__row-quarter">
            <div className="build-dk-step__branch-line" />
          </div>
          <div className="build-dk-step__row-quarter">
            <div className="build-dk-step__branch-line" />
          </div>
        </div>

        {/* dkPKE, H(ek), raw ek, z merge into the center for concatenation */}
        <svg
          className="build-dk-step__svg"
          viewBox="0 0 480 24"
          width="480"
          height="24"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          <path d="M 60 0 V 19 Q 60 24 65 24 H 240" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 180 0 V 19 Q 180 24 185 24 H 240" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 300 0 V 19 Q 300 24 295 24 H 240" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 420 0 V 19 Q 420 24 415 24 H 240" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <line x1="240" y1="24" x2="240" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
        </svg>

        <div className="build-dk-step__vline" />

        <ConcatBox />

        <div className="build-dk-step__vline" />

        <Node label="dk" variant="leaf" onClick={() => setOpenKey('dk')} />
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

export default BuildDkStep
