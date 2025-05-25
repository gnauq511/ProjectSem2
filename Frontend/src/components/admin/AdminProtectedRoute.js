import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in as admin
    const checkAdminStatus = () => {
      const adminUser = localStorage.getItem('adminUser');
      
      if (!adminUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(adminUser);
        // Check if user has admin role
        if (user.role === 'ADMIN' || user.role) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminProtectedRoute;
