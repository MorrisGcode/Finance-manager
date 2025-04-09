import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '/config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import "./Login.css";

const Login = ({user, setUser}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isNewUser) {
        // Handle signup
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        
        // Update user profile with name
        await updateProfile(userCredential.user, { displayName: name });

        // Save user details to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          displayName: name,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        
        // Automatically sign in after successful signup
        await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        console.log("Signed up and logged in:", userCredential.user);
        
        // Clear form fields
        setEmail("");
        setPassword("");
        setName("");
        
        setSuccess("Sign up successful! You are now logged in.");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        // Handle login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        
        // Update last login time in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });
        
        setUser(userCredential.user);
        console.log("Logged in:", userCredential.user);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isNewUser ? "Sign Up" : "Login"}</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit}>
          {isNewUser && (
            <>
              <div className="form-group">
                <label>Full Name: </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
            </>
          )}
          <div className="form-group">
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {isNewUser ? "Sign Up" : "Login"}
          </button>
        </form>
        <p>
          {isNewUser ? "Already have an account?" : "New user?"}{" "}
          <button
            onClick={() => setIsNewUser(!isNewUser)}
            className="toggle-btn"
          >
            {isNewUser ? "Login" : "Sign Up"}
          </button>
        </p>
        <button
          onClick={() => navigate('/')}
          className="back-btn"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
export default Login;