import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import Footer from "./components/layout/Footer.jsx";
import StepTree from "./components/layout/StepTree.jsx";
import { keygenSteps } from "./data/steps.js";

function App() {
  return (
    <>
      <HomePage />

      {/* ── StepTree test (remove once confirmed) ── */}
      <div style={{ padding: 32, background: 'var(--color-surface)', display: 'inline-block', margin: 32, borderRadius: 8 }}>
        <StepTree
          steps={keygenSteps}
          currentStepIndex={4}
          onStepClick={step => console.log('clicked:', step.id)}
        />
      </div>

      <Footer
        label="DIPLOMA THESIS"
        name="MARIJA STAKIĆ"
        university="UNIVERSITY OF BELGRADE"
        year="2026"
      />
    </>
  );
}

export default App;
