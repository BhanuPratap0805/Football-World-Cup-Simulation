import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Simulation from './pages/Simulation'
import Results from './pages/Results'
import Methodology from './pages/Methodology'
import Data from './pages/Data'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="relative z-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/simulate" element={<Simulation />} />
          <Route path="/results" element={<Results />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App