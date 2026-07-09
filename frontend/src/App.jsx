import "./App.css";

import Footer from "./components/layout/Footer";
import StepCircle from "./components/shared/StepCircle"
function App() {

  return (
    <>
      <StepCircle></StepCircle>
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
