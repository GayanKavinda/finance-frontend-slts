// src/components/Providers.js

'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SnackbarProvider } from 'notistack';
import CustomToast from './Notifications';

export default function Providers({ children }) {
  return (
    <SnackbarProvider 
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      Components={{
        success: CustomToast,
        error: CustomToast,
        warning: CustomToast,
        info: CustomToast,
        default: CustomToast,
      }}
      autoHideDuration={4000}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </SnackbarProvider>
  );
}