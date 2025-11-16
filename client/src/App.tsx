import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Welcome from './pages/Welcome'
import Agendamento from './pages/Agendamento'
import Header from './components/header'
import AuthInitializer from './components/AuthInitializer'
import BreadCrumb from './components/ui/breadCrumb'
import type { RootState } from './app/store'
import './App.css'
import './layout.css'

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Adicionar listener para mudanças no estado da navbar
    const handleNavbarToggle = () => {
      const main = document.querySelector('main');
      const checkbox = document.getElementById('drawer-toggle-custom') as HTMLInputElement;
      
      if (main && checkbox) {
        if (checkbox.checked) {
          main.classList.remove('navbar-closed');
          main.classList.add('navbar-open');
        } else {
          main.classList.remove('navbar-open');
          main.classList.add('navbar-closed');
        }
      }
    };

    // Adicionar event listener
    const checkbox = document.getElementById('drawer-toggle-custom');
    if (checkbox) {
      checkbox.addEventListener('change', handleNavbarToggle);
    }

    // Cleanup
    return () => {
      if (checkbox) {
        checkbox.removeEventListener('change', handleNavbarToggle);
      }
    };
  }, [isAuthenticated]);

  return (
    <>
      <AuthInitializer />
      
      {/* Mostrar Header e BreadCrumb apenas se autenticado */}
      {isAuthenticated && <Header />}
      
      <main className={`flex flex-col min-h-screen bg-base-300 overflow-hidden ${
        isAuthenticated ? 'navbar-layout navbar-closed' : 'w-full'
      }`}>
        
        {/* Mostrar BreadCrumb apenas se autenticado */}
        {isAuthenticated && <BreadCrumb />}
        
        <Routes>
          <Route path="/" element={isAuthenticated ? <Agendamento /> : <Welcome />} />
          <Route path="/agendamento" element={isAuthenticated ? <Agendamento /> : <Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </>
  )
}

export default App

