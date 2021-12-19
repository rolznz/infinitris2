import React from 'react';
import useLoggedInRedirect from '../hooks/useLoggedInRedirect';
import Login from '../ui/Login/Login';

export default function LoginPage() {
  useLoggedInRedirect();

  return <Login />;
}
