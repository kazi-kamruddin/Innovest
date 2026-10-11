import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const API_BASE = import.meta.env.VITE_API_URL;

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);

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
      const status = err.response?.status;
      const message = !status
        ? 'Could not reach the server. Please try again shortly.'
        : status >= 500
          ? 'Sign in is temporarily unavailable. Please try again shortly.'
          : status === 401
            ? 'Invalid credentials. Please try again.'
            : err.response?.data?.error || 'Sign in failed. Please try again.';
      setError(message);
      setErrorCode(err.response?.data?.code || `HTTP_${status || 0}`);
      setIsLoading(false);
      return false; 
    }
  };

  return { login, isLoading, error, errorCode };
};
