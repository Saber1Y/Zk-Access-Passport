import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Remit from './pages/Remit'
import RWA from './pages/RWA'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/remit" element={<Remit />} />
          <Route path="/rwa" element={<RWA />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
