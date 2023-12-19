import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Login from './pages/Login';
import HomePage from './pages/HomePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthenticationStatus = async () => {
      const storedAuthStatus = localStorage.getItem('isAuthenticated');
      console.log('Stored Auth Status:', storedAuthStatus);
      if (storedAuthStatus) {
        setIsAuthenticated(JSON.parse(storedAuthStatus));
      }
      setIsLoading(false);
    };

    loadAuthenticationStatus();
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem('isAuthenticated', JSON.stringify(status));
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ?
          <>
            <HomePage onLogout={handleLogout} />
            <Navigate to="/" />
          </>
          : (
            <>
              <Login onLogin={handleLogin} />
              <Navigate to="/login" />
            </>
          )} />
        <Route path="/" element={isAuthenticated ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
