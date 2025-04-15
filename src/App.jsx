import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "/config/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";
import Expenses from "./components/Expenses";
import AllExpenses from "./components/AllExpenses";
import Income from "./components/Income";
import AllIncomes from "./components/AllIncomes";
import Savings from "./components/Savings";
import CategoryManager from "./components/CategoryManager";
import IncomeCategoryManager from "./components/IncomeCategoryManager";
import "./App.css";

// Create a PrivateRoute component for protected routes
const PrivateRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />
        <Route 
          path="/login" 
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" replace />} 
        />

        {/* wrapped in Layout */}
        <Route
          element={
            <PrivateRoute user={user}>
              <Layout user={user} onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          <Route 
            path="/dashboard" 
            element={<Dashboard user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/expenses" 
            element={<Expenses user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/CategoryManager" 
            element={<CategoryManager user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/incomecategorymanager" 
            element={<IncomeCategoryManager user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/all-expenses" 
            element={<AllExpenses user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/income" 
            element={<Income user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/all-incomes" 
            element={<AllIncomes user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/savings" 
            element={<Savings user={user} onLogout={handleLogout} />} 
          />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
