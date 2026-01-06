'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MenuCloser({ closeAllMenus }) {
  const pathname = usePathname();

  useEffect(() => {
    closeAllMenus();
  }, [pathname, closeAllMenus]);

  return null;
}
