'use client';

import { useEffect } from 'react';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';

export default function SecurityTab({ setLoginHistory, setActiveSessions }) {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const [historyRes, sessionsRes] = await Promise.all([
          axios.get('/api/login-history'),
          axios.get('/api/active-sessions')
        ]);
        setLoginHistory(historyRes.data);
        setActiveSessions(sessionsRes.data);
      } catch (err) {
        console.error('Failed to fetch security data', err);
        enqueueSnackbar('Failed to fetch security data', { variant: 'error' });
      }
    };

    fetchSecurityData();
  }, [setLoginHistory, setActiveSessions, enqueueSnackbar]);

  return null;
}
