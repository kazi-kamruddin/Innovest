import { useReducer, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, authReducer } from "./authState.js";

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiresAt = Number(decoded.exp) * 1000;

        if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: "LOGOUT" });
        } else if (storedUser) {
          const { id, name, email } = JSON.parse(storedUser);
          const user = { id, name, email };
          localStorage.setItem("user", JSON.stringify(user));
          dispatch({ type: "LOGIN", payload: user });
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
      }
    }

    setLoading(false);
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
      {children}
    </AuthContext.Provider>
  );
};
