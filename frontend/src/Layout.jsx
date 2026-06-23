import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <h1 className="nav-title">ZK Access Passport</h1>
        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/remit">Remit Demo</NavLink>
          <NavLink to="/rwa">RWA Demo</NavLink>
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
