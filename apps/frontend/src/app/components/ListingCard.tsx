'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface ListingCardProps {
  id: string | number;
  title: string;
  price: string | number;
  image: string;
}

const ListingCard: React.FC<ListingCardProps> = ({ id, title, price, image }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/listings/${id}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow" onClick={handleClick}>
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <p className="text-secondary">{price}</p>
      </div>
    </div>
  );
};

export default ListingCard;
