import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./views/Login.jsx";
import Home from "./views/Home.jsx";
import About from "./views/About.jsx";
import Analysis from "./views/Analysis.jsx";

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
    </Router>
  );
}

export default App;
