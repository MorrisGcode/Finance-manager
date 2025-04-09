import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Take Control of Your Finances</h1>
        <div className="tagline">
          <p className="main-text">Smart money management starts here</p>
          <p className="sub-text">Track expenses, monitor income, and achieve your financial goals</p>
        </div>
        
        <div className="features">
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <p>Track Expenses</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <p>Monitor Income</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <p>View Analytics</p>
          </div>
        </div>

        <button 
          className="cta-button"
          onClick={() => navigate('/login')}
        >
          Get Started Now
        </button>
      </div>
    </div>
  );
}

export default Landing;