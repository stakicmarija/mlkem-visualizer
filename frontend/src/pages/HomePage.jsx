import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Breadcrumb from '../components/layout/Breadcrumb.jsx'
import TunnelArrow from '../components/shared/diagram-boxes/TunnelArrow.jsx'
import ParticipantPanel from '../components/shared/ParticipantPanel.jsx'
import Button from '../components/shared/buttons/Button.jsx'
import Popup from '../components/shared/popup/Popup.jsx'
import { explanations } from '../data/explanations.js'
import { toSpacedHex } from '../utils/hex.js'
import data from '../data/mlkem_768_data.json'
import './HomePage.css'

function bytes(hex) {
  return hex.length / 2
}

const ALICE_STEPS = [
  { title: 'KEY GENERATION', description: 'Generates a key pair and sends the public key to Bob.' },
  { title: 'DECAPSULATION', description: 'Uses her secret key and the received ciphertext to recover the shared secret.' },
]

const BOB_STEPS = [
  { title: 'ENCAPSULATION', description: "Generates a ciphertext using Alice's public key and sends it back." },
]

const ABOUT_TEXT = `A post-quantum key encapsulation mechanism standardized by NIST (FIPS 203) in 2024. Its security relies on the Module-LWE problem over lattices, resistant to both classical and quantum attacks. All values shown are generated using the 768 parameter set.`

const EK_TRAVEL_DURATION = 1 // seconds
const C_TRAVEL_DURATION = 1 // seconds

// 'traveling' -> arrow slides along the tunnel, source side glows
// 'arrived'   -> arrow at rest, destination side glows
// Only animates on the flag's natural forward arrival (justArrived); any
// other way of reaching this combination of flags (breadcrumb, browser
// back/forward, Prev from the next phase) shows the settled state.
function getEkPhase(keygenComplete, encapsComplete, justArrived) {
  if (encapsComplete) return 'arrived'
  if (keygenComplete) return justArrived ? 'traveling' : 'arrived'
  return null
}

function getCPhase(encapsComplete, justArrived) {
  if (encapsComplete) return justArrived ? 'traveling' : 'arrived'
  return null
}

function HomePage() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  // Set by KeyGenPage/EncapsPage when Next is clicked on their last step.
  // Plain router state rather than localStorage — matches CLAUDE.md's "no
  // persistence needed" stance; it's fine for this to reset on a hard refresh.
  const keygenComplete = !!location.state?.keygenComplete
  const encapsComplete = !!location.state?.encapsComplete
  const decapsComplete = !!location.state?.decapsComplete
  const justArrived = !!location.state?.justArrived

  const [openSecret, setOpenSecret] = useState(null) // 'alice' | 'bob' | null

  // No breadcrumb on the very first, initial HomePage state (nothing
  // complete yet) -- it only appears once the flow has actually started.
  const breadcrumbStage = decapsComplete ? 'complete' : encapsComplete ? 'c-sent' : keygenComplete ? 'ek-sent' : null

  const [ekPhase, setEkPhase] = useState(() => getEkPhase(keygenComplete, encapsComplete, justArrived))
  const [cPhase, setCPhase] = useState(() => getCPhase(encapsComplete, justArrived))

  // HomePage/ek-sent/c-sent all share the SAME route ('/'), just different
  // router state -- e.g. the breadcrumb's "EK SENT" link while already on
  // "c sent". That's a same-route navigation, so React Router re-renders
  // this same component instance instead of remounting it, and the
  // useState initializers above never re-run. Without this effect,
  // ekPhase/cPhase go stale (still reflecting the PREVIOUS state) while
  // keygenComplete/encapsComplete update immediately, producing
  // inconsistent renders — e.g. both the ek-sent and c-sent CTAs/glows
  // visible at once. location.key is unique per navigation (even
  // same-route ones), so this keeps phase state in sync on every visit.
  useEffect(() => {
    setEkPhase(getEkPhase(keygenComplete, encapsComplete, justArrived))
    setCPhase(getCPhase(encapsComplete, justArrived))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  // Brief "loading into" pause: the Key Generation circle glows and the
  // button reads "Starting...", then we move on — no interaction needed.
  useEffect(() => {
    if (!isStarting) return
    const timer = setTimeout(() => navigate('/keygen'), 900)
    return () => clearTimeout(timer)
  }, [isStarting, navigate])

  const aliceActiveStep =
    isStarting || ekPhase === 'traveling' ? 'KEY GENERATION'
    : cPhase === 'arrived' && !decapsComplete ? 'DECAPSULATION'
    : null
  const bobActiveStep = ekPhase === 'arrived' && cPhase !== 'arrived' ? 'ENCAPSULATION' : null

  return (
    <main className="home-page">
      {breadcrumbStage && <Breadcrumb stage={breadcrumbStage} />}

      <div className="home__intro">
        <PageHeader title="ML-KEM 768" subtitle="AN INTERACTIVE VISUALIZATION" />
        <p className="body-text home__description">{ABOUT_TEXT}</p>
        <button className="home__about-btn" onClick={() => setAboutOpen(true)}>
          About ›
        </button>
      </div>

      <div className="home__diagram">
        <ParticipantPanel
          name="ALICE"
          steps={ALICE_STEPS}
          activeStep={aliceActiveStep}
          badge={keygenComplete ? 'dk' : undefined}
          footerBadge={decapsComplete ? "K'" : undefined}
          onFooterBadgeClick={decapsComplete ? () => setOpenSecret('alice') : undefined}
          footerBadgeStrong={decapsComplete}
        />
        <div className="home__arrows">
          <TunnelArrow
            label="ek"
            detail="(public key)"
            direction="forward"
            compact={keygenComplete && ekPhase !== 'traveling'}
            traveling={ekPhase === 'traveling'}
            travelDuration={EK_TRAVEL_DURATION}
            onTravelComplete={() => setEkPhase('arrived')}
          />
          <TunnelArrow
            label="c"
            detail="(ciphertext)"
            direction="backward"
            compact={cPhase === 'arrived'}
            traveling={cPhase === 'traveling'}
            travelDuration={C_TRAVEL_DURATION}
            onTravelComplete={() => setCPhase('arrived')}
          />
        </div>
        <ParticipantPanel
          name="BOB"
          steps={BOB_STEPS}
          activeStep={bobActiveStep}
          footerBadge={encapsComplete ? 'K' : undefined}
          onFooterBadgeClick={decapsComplete ? () => setOpenSecret('bob') : undefined}
          footerBadgeStrong={decapsComplete}
        />
      </div>

      {decapsComplete ? (
        <div className="home__cta">
          <Button variant="primary" icon="restart" onClick={() => navigate('/')}>
            Restart
          </Button>
          <p className="micro-label home__cta-hint">
            K = K′ — Alice and Bob now share the same secret, without ever sending it directly.
          </p>
        </div>
      ) : !keygenComplete && (
        <div className="home__cta">
          <Button variant="primary" icon="next" onClick={() => setIsStarting(true)} disabled={isStarting}>
            {isStarting ? 'Starting...' : 'Start Visualization'}
          </Button>
          <p className="micro-label home__cta-hint">
            You will be guided through each step of the algorithm.
          </p>
        </div>
      )}

      {ekPhase === 'arrived' && !encapsComplete && (
        <div className="home__cta">
          <Button variant="primary" icon="next" onClick={() => navigate('/encaps')}>
            Enter Encapsulation
          </Button>
          <p className="micro-label home__cta-hint">
            Bob has received ek and is ready to encapsulate the shared secret.
          </p>
        </div>
      )}

      {cPhase === 'arrived' && !decapsComplete && (
        <div className="home__cta">
          <Button variant="primary" icon="next" onClick={() => navigate('/decaps')}>
            Enter Decapsulation
          </Button>
          <p className="micro-label home__cta-hint">
            Alice has received c and is ready to decapsulate the shared secret.
          </p>
        </div>
      )}

      <Popup
        title="About"
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      >
        {ABOUT_TEXT}
      </Popup>

      {openSecret && (
        <Popup
          title={openSecret === 'alice' ? explanations.KFinal.title : explanations.K.title}
          body={openSecret === 'alice' ? explanations.KFinal.body : explanations.K.body}
          value={toSpacedHex(openSecret === 'alice' ? data.decaps.K_final : data.encaps.K)}
          valueLabel={`${bytes(openSecret === 'alice' ? data.decaps.K_final : data.encaps.K)} bytes`}
          isOpen
          onClose={() => setOpenSecret(null)}
        />
      )}
    </main>
  )
}

export default HomePage
