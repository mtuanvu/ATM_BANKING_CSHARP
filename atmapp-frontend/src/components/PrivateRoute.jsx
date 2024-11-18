import React from 'react';
import { Navigate } from 'react-router-dom';  // Dùng Navigate để điều hướng

const PrivateRoute = ({ component: Component }) => {
  const token = localStorage.getItem('token');  // Kiểm tra token từ localStorage

  return token ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
