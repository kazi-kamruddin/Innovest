import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import "../styles/reg-login.css";

function RegLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate('/');

  };

  return (
    <div className="container9">

      <h1 className="login-heading">Enter Your Credentials</h1>

      <div className="login-box">
     
        <div className="left">
          <h2>Sign In</h2>
          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-submit" disabled={isLoading}>Sign In</button>
          </form>
        </div>

    
        <div className="right">
          <h2>Welcome to login</h2>
          <p>Don't have an account?</p>
     
          <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default RegLogin;

