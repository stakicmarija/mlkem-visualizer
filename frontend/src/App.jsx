import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import KeyGenPage from './pages/KeyGenPage.jsx'
import EncapsPage from './pages/EncapsPage.jsx'
import DecapsPage from './pages/DecapsPage.jsx'
import Footer from './components/layout/Footer.jsx'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={
          <>
            <HomePage />
            <Footer
              label="DIPLOMA THESIS"
              name="MARIJA STAKIĆ"
              university="UNIVERSITY OF BELGRADE"
              year="2026"
            />
          </>
        } />
        <Route path="/keygen" element={<KeyGenPage />} />
        <Route path="/encaps" element={<EncapsPage />} />
        <Route path="/decaps" element={<DecapsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App