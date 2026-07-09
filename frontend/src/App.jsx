import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import Footer from "./components/layout/Footer.jsx";

function App() {
  return (
    <>
      <HomePage />
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
