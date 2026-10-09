import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import "../styles/reg-login.css";

function RegLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, error, isLoading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    const success = await login(email, password);

    if (success) {
      setSuccessMsg('Login successful!');
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/');
    }
  };




  return (
    <div className="container9">

      <h1 className="login-heading">Enter Your Credentials</h1>

      <div className="login-box">
     
        <div className="left">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email" 
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <div className="error-box">Invalid credentials. Please try again.</div>}
            {successMsg && <div className="success-box">{successMsg}</div>}
            <button type="submit" className="btn-submit" disabled={isLoading}>Sign In</button>
          </form>

        </div>

    
        <div className="right">
          <h2>Welcome to login</h2>
          <p>Don&apos;t have an account?</p>
     
          <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default RegLogin;

