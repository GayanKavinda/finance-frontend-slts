'use client';

import { useEffect, useRef } from 'react';
import axios from '@/lib/axios';

const useAutoLogout = (timeout = 30 * 60 * 1000) => { // Default 30 minutes
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logoutUser, timeout);
  };

  const logoutUser = async () => {
    try {
      await axios.post('/api/logout');
      window.location.href = '/signin?reason=inactivity';
    } catch (err) {
      console.error('Auto logout failed', err);
      window.location.href = '/signin';
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimer();

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeout]);
};

export default useAutoLogout;
