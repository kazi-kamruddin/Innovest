import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('user'));
  
    if (!storedUser || storedUser.email !== email || storedUser.password !== password) {
      alert("Invalid credentials");
      return;
    }
  
    // ✅ Store authToken and email
    localStorage.setItem("authToken", "some_random_token");
    localStorage.setItem("userEmail", storedUser.email);
  
    alert("Login Successful!");
    navigate('/dashboard');
  };
  

  return (
    <div className="container">
      <h2>Login Page</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}

export default Login;
