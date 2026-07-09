import "./App.css";
import Footer from "./components/layout/Footer.jsx";
import GeneratedValuesPanel from "./components/layout/GeneratedValuesPanel.jsx";

const TEST_ITEMS = [
  { symbol: 'ρ', state: 'done', value: 'a3f1...bb92' },
  { symbol: 'σ', state: 'done', value: 'c7e2...4401' },
  { symbol: 'A', state: 'loading' },
  { symbol: 's', state: 'loading' },
  { symbol: 'e', state: 'pending' },
  { symbol: 't', state: 'pending' },
]

function App() {
  return (
    <>
      <div style={{ padding: 40, display: 'flex', gap: 32, background: 'var(--color-bg)', minHeight: '100vh' }}>
        <GeneratedValuesPanel items={TEST_ITEMS} />
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
