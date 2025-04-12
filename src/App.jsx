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
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      {!user ? (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={<Login user={user} setUser={setUser} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout user={user} onLogout={() => auth.signOut()}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route
              path="/add-expense"
              element={<Expenses user={user} />}
            />
            <Route
              path="/all-expenses"
              element={<AllExpenses user={user} />}
            />
            <Route
              path="/add-income"
              element={<Income user={user} />}
            />
            <Route
              path="/all-incomes"
              element={<AllIncomes user={user} />}
            />
            <Route
              path="/add-savings"
              element={<Savings user={user} />}
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;
