import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import ProductList from './pages/ProductList';
import NewBatch from './pages/NewBatch';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes inside Layout */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/product-list" element={<ProductList />} />
              <Route path="/new-batch" element={<NewBatch />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
