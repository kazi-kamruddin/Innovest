import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const API_BASE = import.meta.env.VITE_API_URL;

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE}/user/login`,
        { email, password },
        { withCredentials: true }
      );

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN', payload: user });
        setIsLoading(false);
        return true; 
      }
      setIsLoading(false);
      return false; 
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
      setIsLoading(false);
      return false; 
    }
  };

  return { login, isLoading, error };
};
