import { Fragment, useReducer, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, authReducer } from "./authState.js";

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      let user = null;
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
          const decoded = jwtDecode(token);
          const expiresAt = Number(decoded.exp) * 1000;
          const { id, name, email } = JSON.parse(storedUser);
          if (Number.isFinite(expiresAt) && expiresAt > Date.now() && Number.isSafeInteger(Number(id)) && Number(id) > 0 &&
              (decoded.id == null || Number(decoded.id) === Number(id))) user = { id, name, email };
        }
      } catch { /* Ignore incomplete or malformed stored sessions. */ }
      // Reading another tab's session must never overwrite its in-progress login.
      dispatch(user ? { type: 'LOGIN', payload: user } : { type: 'LOGOUT' });
    };

    restoreSession();
    setLoading(false);
    let storageTimer;
    const onStorage = (event) => {
      if (event.storageArea === localStorage && [null, 'user', 'token'].includes(event.key)) {
        clearTimeout(storageTimer);
        storageTimer = setTimeout(restoreSession, 0);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => { clearTimeout(storageTimer); window.removeEventListener('storage', onStorage); };
  }, []);

  useEffect(() => {
    if (!state.user) return;

    let expiresAt;
    try {
      expiresAt = Number(jwtDecode(localStorage.getItem("token")).exp) * 1000;
    } catch {
      expiresAt = NaN;
    }

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      return;
    }

    const timer = setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    }, expiresAt - Date.now());

    return () => clearTimeout(timer);
  }, [state.user]);


  if (loading) return null;

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      <Fragment key={state.user?.id ?? 'guest'}>{children}</Fragment>
    </AuthContext.Provider>
  );
};
