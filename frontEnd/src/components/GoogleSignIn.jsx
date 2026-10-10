import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
let scriptPromise;
let initializedClientId;
let credentialHandler;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Google sign-in could not be loaded.'));
      document.head.appendChild(script);
    }).catch((error) => {
      scriptPromise = undefined;
      throw error;
    });
  }
  return scriptPromise;
}

export default function GoogleSignIn() {
  const buttonRef = useRef(null);
  const inFlightRef = useRef(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const [linkCredential, setLinkCredential] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const exchange = useCallback(async (credential, password) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setWorking(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/user/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, ...(password ? { linkPassword: password } : {}) }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 409 && data.code === 'LINK_REQUIRED') {
        setLinkCredential(credential);
        setError(data.error);
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Google sign-in failed.');
      if (!data.token || !data.user) throw new Error('Google sign-in returned an incomplete session.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'LOGIN', payload: data.user });
      navigate('/', { replace: true });
    } catch (exchangeError) {
      setError(exchangeError.message || 'Google sign-in failed.');
    } finally {
      inFlightRef.current = false;
      setWorking(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!clientId || !apiBase) return undefined;
    let active = true;
    const buttonElement = buttonRef.current;
    const handleCredential = (response) => {
      if (active && response?.credential) {
        setLinkCredential('');
        setLinkPassword('');
        exchange(response.credential);
      }
    };
    loadGoogleScript().then(() => {
      if (!active || !buttonElement || !window.google?.accounts?.id) return;
      credentialHandler = handleCredential;
      if (initializedClientId !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => credentialHandler?.(response),
        });
        initializedClientId = clientId;
      }
      window.google.accounts.id.renderButton(buttonElement, {
        theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with',
        width: Math.min(buttonElement.clientWidth || 355, 355),
      });
    }).catch((loadError) => { if (active) setError(loadError.message); });
    return () => {
      active = false;
      if (credentialHandler === handleCredential) credentialHandler = undefined;
      buttonElement?.replaceChildren();
    };
  }, [exchange]);

  if (!clientId || !apiBase) return null;
  return <div className="mt-5! w-full!">
    <div className="mb-4! flex! items-center! gap-3! text-[11px]! text-[#8A998D]!">
      <span className="h-px! flex-1! bg-[#DCE8DE]!" />or continue with<span className="h-px! flex-1! bg-[#DCE8DE]!" />
    </div>
    <div ref={buttonRef} className="mx-auto! flex! min-h-[42px]! w-full! justify-center!" aria-label="Sign in with Google" />
    {working && <p role="status" className="mb-0! mt-2! text-center! text-[12px]! text-[#64816B]!">Connecting your account...</p>}
    {error && <p role="alert" className="mb-0! mt-3! rounded-lg! border! border-[#EBC9C4]! bg-[#FFF4F2]! px-3! py-2.5! text-[12px]! text-[#B34942]!">{error}</p>}
    {linkCredential && <form onSubmit={(event) => { event.preventDefault(); exchange(linkCredential, linkPassword); }} className="mt-3! flex! flex-col! gap-2!">
      <label htmlFor="google-link-password" className="text-[12px]! font-medium! text-[#334B3A]!">Existing Innovest password</label>
      <input id="google-link-password" type="password" autoComplete="current-password" required value={linkPassword}
        onChange={(event) => setLinkPassword(event.target.value)} disabled={working}
        className="h-[46px]! w-full! rounded-lg! border! border-[#D4DFD5]! bg-white! px-4! text-[14px]! text-[#24352E]! focus:border-[#477957]! focus:outline-none!" />
      <button type="submit" disabled={working} className="min-h-[43px]! rounded-lg! border-0! bg-[#345C3D]! px-4! text-[13px]! font-semibold! text-white! hover:bg-[#254B33]! disabled:opacity-60!">Connect Google account</button>
    </form>}
  </div>;
}
