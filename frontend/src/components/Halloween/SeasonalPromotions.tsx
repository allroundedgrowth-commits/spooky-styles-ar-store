import React from 'react';
import { Link } from 'react-router-dom';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl?: string;
  link: string;
  endDate?: string;
}

interface SeasonalPromotionsProps {
  promotions?: Promotion[];
}

const defaultPromotions: Promotion[] = [
  {
    id: '1',
    title: '🌙 New Arrivals',
    description: 'Fresh styles for every occasion - professional, casual, and costume wigs',
    discount: '20% OFF',
    link: '/products?category=featured',
    endDate: 'Limited Time',
  },
  {
    id: '2',
    title: '✨ AR Try-On Special',
    description: 'Experience our cutting-edge AR technology - see before you buy',
    discount: 'FREE Shipping',
    link: '/ar-tryon',
    endDate: 'All Orders',
  },
  {
    id: '3',
    title: '🎭 Bundle & Save',
    description: 'Special bundle deals on premium wigs',
    discount: 'Buy 2 Get 1 FREE',
    link: '/products',
    endDate: 'While Supplies Last',
  },
];

const SeasonalPromotions: React.FC<SeasonalPromotionsProps> = ({ 
  promotions = defaultPromotions 
}) => {
  return (
    <section className="py-12 px-4 bg-gradient-halloween relative overflow-hidden">
      {/* Decorative elements - More creepy, less Halloween-specific */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-float">🕷️</div>
        <div className="absolute top-20 right-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>🦇</div>
        <div className="absolute bottom-10 left-1/4 text-4xl animate-float" style={{ animationDelay: '2s' }}>🕸️</div>
        <div className="absolute bottom-20 right-1/3 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>👁️</div>
        <div className="absolute top-1/2 left-1/3 text-4xl animate-float" style={{ animationDelay: '1.5s' }}>🦴</div>
        <div className="absolute top-1/3 right-1/4 text-3xl animate-float" style={{ animationDelay: '2.5s' }}>🕷️</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            ✨ Special Offers ✨
          </h2>
          <p className="text-halloween-orange text-lg">
            Exclusive deals on premium wigs - Transform your look today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo, index) => (
            <Link
              key={promo.id}
              to={promo.link}
              className="group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-halloween-black/80 border-2 border-halloween-orange rounded-lg p-6 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-halloween-orange/50 hover:border-halloween-purple">
                {/* Discount badge */}
                <div className="inline-block bg-halloween-orange text-white font-bold px-4 py-2 rounded-full mb-4 text-lg transform group-hover:rotate-3 transition-transform">
                  {promo.discount}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-halloween-orange transition-colors">
                  {promo.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 mb-4">
                  {promo.description}
                </p>

                {/* End date */}
                {promo.endDate && (
                  <div className="flex items-center text-sm text-halloween-purple">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="mr-2"
                    >
                      <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
                      <path d="M8 4v4.5l3.5 2.1.7-1.2-3-1.8V4z"/>
                    </svg>
                    <span>Ends: {promo.endDate}</span>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-4 text-halloween-orange font-semibold group-hover:text-white transition-colors flex items-center">
                  Shop Now
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="ml-2 transform group-hover:translate-x-2 transition-transform"
                  >
                    <path d="M10 0L8.59 1.41 15.17 8H0v2h15.17l-6.58 6.59L10 18l8-8z"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-block btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-halloween-orange/50"
          >
            Explore All Wigs ✨
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeasonalPromotions;
