import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import KeyGenPage from './pages/KeyGenPage.jsx'
import Footer from './components/layout/Footer.jsx'

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
