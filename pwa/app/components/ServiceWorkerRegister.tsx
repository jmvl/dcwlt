'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // TODO: Service worker disabled due to Serwist + Next.js 16 compatibility issue
    // See: https://github.com/serwist/serwist/issues/54
    // if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    //   navigator.serviceWorker
    //     .register('/sw.js')
    //     .then((registration) => {
    //       console.log('Service Worker registered successfully:', registration);
    //     })
    //     .catch((error) => {
    //       console.error('Service Worker registration failed:', error);
    //     });
    // }
  }, []);

  return null;
}
