import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Remove the named exports and create a custom hook instead
const useAuth = () => {
  return useContext(AuthContext);
};

// Change this to default export
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Extract user ID from token (simple decoding without jwt library)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;
        
        if (userId) {
          // Fetch user data
          axios.get(`/api/auth/user?userId=${userId}`)
            .then(response => {
              setCurrentUser(response.data);
            })
            .catch(error => {
              console.error('Error fetching user data', error);
              localStorage.removeItem('token');
              delete axios.defaults.headers.common['Authorization'];
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error decoding token', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // In your login function in AuthContext.js
const login = async (email, password) => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    
    if (response.data && response.data.token) {
      const { token: newToken, user } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } else {
      return { 
        success: false, 
        message: response.data?.message || 'Invalid server response' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
    };
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    currentUser,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export as default
export default AuthProvider;
// Export the hook as a named export
export { useAuth };