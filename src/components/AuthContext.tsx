import React, { createContext, useState, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  setToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const isLoggedIn = !!token;

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
