import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CarProvider } from './context/CarContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SavedCars from './pages/SavedCars'
import MyBookings from './pages/MyBookings'
import MyProfile from './pages/MyProfile'
import CarDetails from './pages/CarDetails'
import './App.css'

function App() {
  const PrivateRoute = ({ children }) => {
    const user = localStorage.getItem('currentUser')
    return user ? children : <Navigate to="/login" />
  }

  return (
    <CarProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/saved" element={<SavedCars />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/my-bookings" element={
                <PrivateRoute>
                  <MyBookings />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <MyProfile />
                </PrivateRoute>
              } />
              <Route path="/car/:id" element={<CarDetails />} />
              {/* Redirect old routes */}
              <Route path="/rent" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CarProvider>
  )
}

export default App
