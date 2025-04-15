import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import '../css/Layout.css';

const Layout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="side-menu">
        <div className="menu-header">
          <h3>Finance Manager</h3>
        </div>
        <nav className="menu-items">
          <button
            onClick={() => navigate("/dashboard")}
            className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/CategoryManager")}
            className={`menu-item ${location.pathname === '/categorymanager' ? 'active' : ''}`}
          >
            Manage Expenses
          </button>
          <button
            onClick={() => navigate("/incomecategorymanager")}
            className={`menu-item ${location.pathname === '/incomecategorymanager' ? 'active' : ''}`}
          >
            Manage Income
          </button>
          <button
            onClick={() => navigate("/all-expenses")}
            className={`menu-item ${location.pathname === '/all-expenses' ? 'active' : ''}`}
          >
            All Expenses
          </button>
          <button
            onClick={() => navigate("/all-incomes")}
            className={`menu-item ${location.pathname === '/all-incomes' ? 'active' : ''}`}
          >
            All Incomes
          </button>
          <button
            onClick={() => navigate("/savings")}
            className={`menu-item ${location.pathname === '/savings' ? 'active' : ''}`}
          >
            Savings
          </button>
        </nav>
        <button 
          onClick={onLogout} 
          className="logout-btn"
        >
          Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;