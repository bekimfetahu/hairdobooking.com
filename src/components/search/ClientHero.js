'use client';
import React from 'react';
import Hero from '@/components/search/Hero';

/**
 * ClientHero - Client wrapper for Hero component
 * Handles search and event handlers since page.js is SSR
 */
export default function ClientHero() {
  const handleSearch = (searchData) => {
    console.log('Search query:', searchData.query);
    console.log('Location:', searchData.location);
    // TODO: Implement search logic / API call
  };

  return (
    <Hero onSearch={handleSearch} />
  );
}

