'use client';

import { useEffect } from 'react';

export default function TestEffect() {
  useEffect(() => {
    console.log('✅ TestEffect did run - hydration is working!');
  }, []);
  
  return null;
} 