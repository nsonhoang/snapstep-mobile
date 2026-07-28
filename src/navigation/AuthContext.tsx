import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface User {
  id: string;
  
}

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>({id:"1"});

  const login = (): void => {
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user,isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
