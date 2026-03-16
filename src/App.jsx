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
import Dashboard from './admin/Dashboard'
import ManageCars from './admin/ManageCars'
import ManageBookings from './admin/ManageBookings'
import ManageUsers from './admin/ManageUsers'
import BookingCalendar from './admin/BookingCalendar'
import NotFound from './pages/NotFound'
import AdminRoute from './components/AdminRoute'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const PrivateRoute = ({ children }) => {
    const { isLoggedIn, authLoading } = useAuth()
    if (authLoading) return null
    return isLoggedIn ? children : <Navigate to="/login" replace />
  }

  return (
    <AuthProvider>
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
              <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="/admin/cars" element={<AdminRoute><ManageCars /></AdminRoute>} />
              <Route path="/admin/bookings" element={<AdminRoute><ManageBookings /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
              <Route path="/admin/calendar" element={<AdminRoute><BookingCalendar /></AdminRoute>} />
              {/* Redirect old routes */}
              <Route path="/rent" element={<Navigate to="/" />} />
              {/* 404 - catches all unknown URLs */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CarProvider>
    </AuthProvider>
  )
}

export default App
