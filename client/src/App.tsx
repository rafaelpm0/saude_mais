import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Header from './components/header'
import AuthInitializer from './components/AuthInitializer'
import './App.css'
import BreadCrumb from './components/ui/breadCrumb'

function App() {
  return (
    <>
    <AuthInitializer />
    <Header/>
    <main className="flex flex-col w-[calc(100%-48px)] min-h-screen bg-base-300 overflow-w-hidden ">
    <BreadCrumb />
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
    </main>
   
    </>
    
  )
}

export default App

