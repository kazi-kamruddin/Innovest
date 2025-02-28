import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <h2>Login Page</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email" className="form-control" id="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password" className="form-control" id="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>Login</button>
      </form>
    </div>
  );
}

export default Login;