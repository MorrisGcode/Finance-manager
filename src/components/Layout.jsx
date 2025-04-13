import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Layout.css';

const Layout = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="side-menu">
        <div className="menu-header">
          <h3>Expense Manager</h3>
        </div>
        <nav className="menu-items">
          <button
            onClick={() => navigate("/dashboard")}
            className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/expenses")}
            className={`menu-item ${location.pathname === '/expenses' ? 'active' : ''}`}
          >
            Manage Expenses
          </button>
          <button
            onClick={() => navigate("/income")}
            className={`menu-item ${location.pathname === '/income' ? 'active' : ''}`}
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
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;