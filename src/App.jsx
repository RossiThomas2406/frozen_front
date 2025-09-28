import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import AutenticacionFacial from './pages/AutenticacionFacial/AutenticacionFacial'
import MenuPrincipal from './pages/MenuPrincipal/MenuPrincipal'
import Fichaje from './pages/Fichajes/Fichaje'
import Login from './pages/Login/Login'
import Ventas from './pages/Ventas/Ventas'
import './App.css'

import ProtectedRoutes from './utils/ProtectedRoutes'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<ProtectedRoutes></ProtectedRoutes>}>
                <Route path="/autenticacionFacial" element={<AutenticacionFacial />} />
                <Route path="/home" element={<MenuPrincipal />} />
                <Route path="/fichaje" element={<Fichaje />} />
                <Route path="/ventas" element={<Ventas />} />
              </Route>
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App