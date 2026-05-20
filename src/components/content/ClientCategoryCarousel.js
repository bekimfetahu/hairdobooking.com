'use client';
import React from 'react';
import CategoryCarousel from '@/components/content/CategoryCarousel';

const categories = [
  { name: 'Hair', image: '/images/category-hair.png' },
  { name: 'Barber', image: '/images/category-barber.png' },
  { name: 'Nails', image: '/images/category-nails.jpg' },
  { name: 'Skin Care', image: '/images/category-skincare.jpg' },
  { name: 'Massage', image: '/images/category-massage.jpg' },
  { name: 'Makeup', image: '/images/category-makeup.jpg' },
];

export default function ClientCategoryCarousel() {
  const handleCategoryClick = (cat) => {
    console.log(`Clicked ${cat.name}`);
    // TODO: Navigate to category page
  };

  const handleNavigate = (direction) => {
    console.log(`Scrolled ${direction}`);
  };

  return (
    <CategoryCarousel
      title="Popular Categories"
      categories={categories}
      onCategoryClick={handleCategoryClick}
      onNavigate={handleNavigate}
    />
  );
}

