// src/components/Providers.js

'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SnackbarProvider } from 'notistack';

export default function Providers({ children }) {
  return (
    <SnackbarProvider maxSnack={5}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SnackbarProvider>
  );
}