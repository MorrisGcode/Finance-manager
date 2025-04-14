// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { auth } from './config/firebase';
// import { onAuthStateChanged } from 'firebase/auth';

// // Import components
// import Login from './components/Login';
// import Register from './components/Register';
// import Dashboard from './components/Dashboard';
// import Layout from './components/Layout';
// import Income from './components/Income';
// import Expenses from './components/Expenses';
// import CategoryManager from './components/CategoryManager';
// import IncomeCategoryManager from './components/IncomeCategoryManager';
// import AllIncomes from './components/AllIncomes';
// import AllExpenses from './components/AllExpenses';
// import Savings from './components/Savings';
// import PrivateRoute from './components/PrivateRoute';

// function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleLogout = () => {
//     auth.signOut();
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
//         <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        
//         {/* Protected Routes */}
//         <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        
//         <Route 
//           path="/dashboard" 
//           element={
//             <PrivateRoute>
//               <Layout>
//                 <Dashboard 
//                   user={user} 
//                   onLogout={handleLogout} 
//                 />
//               </Layout>
//             </PrivateRoute>
//           } 
//         />

//         <Route path="/income" element={
//           user ? (
//             <Layout user={user}>
//               <Income user={user} />
//             </Layout>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         <Route path="/expenses" element={
//           user ? (
//             <Layout user={user}>
//               <Expenses user={user} />
//             </Layout>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         <Route path="/all-incomes" element={
//           user ? (
//             <Layout user={user}>
//               <AllIncomes user={user} />
//             </Layout>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         <Route path="/all-expenses" element={
//           user ? (
//             <Layout user={user}>
//               <AllExpenses user={user} />
//             </Layout>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         <Route path="/category-manager" element={
//           user ? (
//             <Layout user={user}>
//               <CategoryManager user={user} />
//             </Layout>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         <Route path="/income-category-manager" element={
//           user ? (
//             <Layout user={user}>
//               <IncomeCategoryManager user={user} />
//             </Layout>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         <Route path="/savings" element={
//           user ? (
//             <Layout user={user}>
//               <Savings user={user} />
//             </Layout>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         {/* Catch all route */}
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;