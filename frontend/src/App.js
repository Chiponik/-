import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/admin/*" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;