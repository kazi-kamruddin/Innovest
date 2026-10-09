import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const API_BASE = import.meta.env.VITE_API_URL;

  const signup = async (name, email, password) => {
    setIsLoading(true);
    setError(null);

    const endpoint = `${API_BASE}/user/register`;
    const payload = { name, email, password };
    const headers = { 'Content-Type': 'application/json' };


    try {
      const response = await axios.post(endpoint, payload, { headers });
      

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN', payload: user });
        return true;
      }
      return false; 
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed';
      console.warn('[Signup] Signup failed:', message);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};
