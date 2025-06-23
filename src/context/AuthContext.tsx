
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, UserRole } from "@/types";
import { registerUser, loginUser, getRegisteredUsers } from "@/services/mockDataService";
import { addUserAsSalesperson } from "@/services/salespersonService";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => Promise.resolve(false),
  register: () => Promise.resolve(false),
  logout: () => {},
  requestPasswordReset: () => Promise.resolve(false),
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing login on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Verify user still exists in the system
        const registeredUsers = getRegisteredUsers();
        const userExists = registeredUsers.find(u => u.id === user.id && u.email === user.email);
        if (userExists) {
          setCurrentUser(user);
        } else {
          // Clear invalid stored user
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
    
    // Setup automatic backup system
    import("@/services/mockDataService").then(({ setupAutomaticBackup }) => {
      setupAutomaticBackup();
    });
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = loginUser(email, password);
    console.log("Login result:", user ? "Success" : "Failed");
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      console.log("User logged in and stored:", user);
      return true;
    }
    
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole = UserRole.SALES) => {
    console.log("Attempting registration for:", email);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const registeredUsers = getRegisteredUsers();
    const existingUser = registeredUsers.find(u => u.email === email);
    
    if (existingUser) {
      console.log("User already exists:", email);
      return false; // User already exists
    }
    
    const user = registerUser(name, email, password, role);
    console.log("Registration result:", user ? "Success" : "Failed");
    
    if (user) {
      // Add user as salesperson if they are sales role
      if (user.role === UserRole.SALES) {
        addUserAsSalesperson(user);
      }
      console.log("New user registered:", user);
      return true;
    }
    
    return false;
  };

  const requestPasswordReset = async (email: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const registeredUsers = getRegisteredUsers();
    const user = registeredUsers.find(u => u.email === email);
    
    return !!user; // Return true if user exists
  };

  const logout = () => {
    console.log("User logging out");
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      register, 
      logout, 
      requestPasswordReset, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
