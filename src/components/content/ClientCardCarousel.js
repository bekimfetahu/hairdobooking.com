'use client';
import React from 'react';
import CardCarousel from '@/components/content/CardCarousel';

const salonData = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    subtitle: '45 Oxford Street, London',
    description: 'Premium haircuts and styling',
    image: '/images/salon-1.jpg',
  },
  {
    id: '2',
    name: 'The Brick Room',
    subtitle: '12 Shoreditch, London',
    description: 'Classic barber experience',
    image: '/images/salon-2.jpg',
  },
  {
    id: '3',
    name: 'Pure Beauty Spa',
    subtitle: '88 Kings Road, Chelsea',
    description: 'Skin care and facials',
    image: '/images/salon-3.jpg',
  },
  {
    id: '4',
    name: 'Neon Nails Bar',
    subtitle: '23 Camden High St, London',
    description: 'Nail art and polish',
    image: '/images/salon-4.jpg',
  },
];

export default function ClientCardCarousel({ title, cards }) {
  const handleCardClick = (salon) => {
    console.log('Clicked salon:', salon.name);
  };

  const handleNavigate = (direction) => {
    console.log('Scrolled:', direction);
  };

  return (
    <CardCarousel
      title={title}
      cards={cards}
      cardWidth={280}
      onCardClick={handleCardClick}
      onNavigate={handleNavigate}
    />
  );
}
