"use client";

import { useEffect } from 'react';
import { initLenis, destroyLenis } from '@/lib/lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = initLenis();
    return () => {
      destroyLenis();
    };
  }, []);

  return null;
}
