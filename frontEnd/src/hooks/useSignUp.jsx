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
      if (response.data.verificationRequired) {
        return response.data.emailSent === false ? 'verificationEmailFailed' : 'verificationRequired';
      }
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN', payload: user });
        return 'authenticated';
      }
      return false; 
    } catch (err) {
      const status = err.response?.status;
      const message = !status
        ? 'Could not reach the server. Please try again shortly.'
        : status >= 500
          ? 'Account creation is temporarily unavailable. Please try again shortly.'
          : err.response?.data?.error || 'Could not create your account. Please try again.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};
