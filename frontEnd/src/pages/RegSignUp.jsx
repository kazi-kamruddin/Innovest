import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../hooks/useSignUp';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import "../styles/reg-signup.css";

function RegSignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, error, isLoading } = useSignup();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Signup form submitted with:', { name, email, password });
    
    const success = await signup(name, email, password);
    console.log('Signup returned:', success);

    if (success) {
      navigate('/'); 
    } else {
      console.log('Signup failed or user already exists, staying on signup page.');
    }
  };

  return (
    <div className="container-signup">
      <h2 className="signup-heading">Sign Up</h2>
      <form className="signup-box" onSubmit={handleSubmit}>
        <div className="signup-input-group">
          <label htmlFor="name">Name:</label>
          <div className="input-wrapper">
            <FaUser className="icon" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
        </div>
        <div className="signup-input-group">
          <label htmlFor="email">Email:</label>
          <div className="input-wrapper">
            <FaEnvelope className="icon" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
        </div>
        <div className="signup-input-group">
          <label htmlFor="password">Password:</label>
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
        </div>
        {error && <div className="signup-alert-danger">This email is already registered</div>}
        <button type="submit" className="signup-btn" disabled={isLoading}>Sign Up</button>
      </form>
    </div>
  );
}

export default RegSignUp;
