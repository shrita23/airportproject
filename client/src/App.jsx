import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './landingpage';
import Details from './details';
import Calculator from './calculator';
import SignPage from './signup';
import LoginPage from './login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/details" element={<Details />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/signup" element={<SignPage />} />
      </Routes>
    </Router>
  );
}

export default App;
