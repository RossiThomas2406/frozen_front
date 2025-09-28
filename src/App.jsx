import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import AutenticacionFacial from './pages/AutenticacionFacial/AutenticacionFacial'
import MenuPrincipal from './pages/MenuPrincipal/MenuPrincipal'
import Fichaje from './pages/Fichajes/Fichaje'
import Login from './pages/Login/Login'
import GestionClientes from './pages/GestionClientes/GestionClientes'
import Ventas from './pages/Ventas/Ventas'

import './App.css'


function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/autenticacionFacial" element={<AutenticacionFacial />} />
              <Route path="/home" element={<MenuPrincipal />} />
              <Route path="/fichaje" element={<Fichaje />} />
              <Route path="/clientes" element={<GestionClientes />} />
              <Route path="/ventas" element={<Ventas />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App