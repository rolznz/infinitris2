import React from 'react';
import useLoggedInRedirect from '../hooks/useLoggedInRedirect';
import Login from '../Login';

export default function LoginPage() {
  useLoggedInRedirect();

  return <Login />;
}
