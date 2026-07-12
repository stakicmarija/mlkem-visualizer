import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
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

function HomePage() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  // Set by KeyGenPage when Next is clicked on its last step. Plain router
  // state rather than localStorage — matches CLAUDE.md's "no persistence
  // needed" stance; it's fine for this to reset on a hard refresh.
  const keygenComplete = !!location.state?.keygenComplete

  // 'traveling' -> ek slides along the tunnel, Key Generation glows
  // 'arrived'   -> ek at rest near Bob's side, Encapsulation glows
  // Starts automatically on landing here post-KeyGen — no button needed.
  const [ekPhase, setEkPhase] = useState(keygenComplete ? 'traveling' : null)

  // Brief "loading into" pause: the Key Generation circle glows and the
  // button reads "Starting...", then we move on — no interaction needed.
  useEffect(() => {
    if (!isStarting) return
    const timer = setTimeout(() => navigate('/keygen'), 900)
    return () => clearTimeout(timer)
  }, [isStarting, navigate])

  const aliceActiveStep = isStarting || ekPhase === 'traveling' ? 'KEY GENERATION' : null
  const bobActiveStep = ekPhase === 'arrived' ? 'ENCAPSULATION' : null

  return (
    <main className="home-page">
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
          <TunnelArrow label="c" detail="(ciphertext)" direction="backward" />
        </div>
        <ParticipantPanel name="BOB" steps={BOB_STEPS} activeStep={bobActiveStep} />
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

      {ekPhase === 'arrived' && (
        <div className="home__cta">
          <Button variant="primary" icon="next" onClick={() => navigate('/encaps')}>
            Enter Encapsulation
          </Button>
          <p className="micro-label home__cta-hint">
            Bob has received ek and is ready to encapsulate the shared secret.
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
