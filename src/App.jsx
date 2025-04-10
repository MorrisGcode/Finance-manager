import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from '/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Landing from './components/Landing';
import Expenses from './components/Expenses';
import AllExpenses from './components/AllExpenses';
import Income from './components/Income';
import AllIncomes from './components/AllIncomes';

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
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" /> : <Login user={user} setUser={setUser} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard user={user} onLogout={() => auth.signOut()} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/add-expense" 
            element={
              user ? <Expenses user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/all-expenses" 
            element={
              user ? <AllExpenses user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/add-income" 
            element={
              user ? <Income user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/all-incomes" 
            element={
              user ? <AllIncomes user={user} /> : <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
