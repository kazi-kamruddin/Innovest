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

    console.log('[Signup] Attempting signup');
    console.log('[Signup] Endpoint:', endpoint);
    console.log('[Signup] Method: POST');
    console.log('[Signup] Headers:', headers);
    console.log('[Signup] Payload:', payload);

    try {
      const response = await axios.post(endpoint, payload, { headers });
      
      console.log('[Signup] Response status:', response.status);
      console.log('[Signup] Response data:', response.data);

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN', payload: user });
        console.log('[Signup] Signup successful. Token and user saved.');
        return true;
      }
      return false; 
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      console.warn('[Signup] Signup failed:', message);
      if (err.response) {
        console.warn('[Signup] Error response data:', err.response.data);
      }
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};
