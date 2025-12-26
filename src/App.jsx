import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CarProvider } from './context/CarContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import BuyCars from './pages/BuyCars'
import SellCars from './pages/SellCars'
import RentCars from './pages/RentCars'
import CarDetail from './pages/CarDetail'
import PricePredictor from './pages/PricePredictor'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import './App.css'

function App() {
  return (
    <CarProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/buy" element={<BuyCars />} />
              <Route path="/sell" element={<SellCars />} />
              <Route path="/rent" element={<RentCars />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/price-predictor" element={<PricePredictor />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CarProvider>
  )
}

export default App

