import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Breadcrumb from '../components/layout/Breadcrumb.jsx'
import TunnelArrow from '../components/shared/diagram-boxes/TunnelArrow.jsx'
import ParticipantPanel from '../components/shared/ParticipantPanel.jsx'
import Button from '../components/shared/buttons/Button.jsx'
import Popup from '../components/shared/popup/Popup.jsx'
import './HomePage.css'

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

  // No breadcrumb on the very first, initial HomePage state (nothing
  // complete yet) -- it only appears once the flow has actually started.
  const breadcrumbStage = encapsComplete ? 'c-sent' : keygenComplete ? 'ek-sent' : null

  // 'traveling' -> ek slides along the tunnel, Key Generation glows
  // 'arrived'   -> ek at rest near Bob's side, Encapsulation glows
  // Landing here straight from Encaps means ek already made its trip in an
  // earlier visit — skip straight to 'arrived' instead of replaying it.
  const [ekPhase, setEkPhase] = useState(
    encapsComplete ? 'arrived' : keygenComplete ? 'traveling' : null
  )

  // 'traveling' -> c slides back along the tunnel, Encapsulation glows
  // 'arrived'   -> c at rest near Alice's side, Decapsulation glows
  // Starts automatically the same moment we land here post-Encaps — no
  // separate flag to skip a replay yet, since there's no post-Decaps
  // HomePage state (and therefore no repeat visit) built so far.
  const [cPhase, setCPhase] = useState(encapsComplete ? 'traveling' : null)

  // Brief "loading into" pause: the Key Generation circle glows and the
  // button reads "Starting...", then we move on — no interaction needed.
  useEffect(() => {
    if (!isStarting) return
    const timer = setTimeout(() => navigate('/keygen'), 900)
    return () => clearTimeout(timer)
  }, [isStarting, navigate])

  const aliceActiveStep =
    isStarting || ekPhase === 'traveling' ? 'KEY GENERATION'
    : cPhase === 'arrived' ? 'DECAPSULATION'
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
        />
      </div>

      {!keygenComplete && (
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

      {cPhase === 'arrived' && (
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
    </main>
  )
}

export default HomePage
