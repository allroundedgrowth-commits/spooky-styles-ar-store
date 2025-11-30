import React from 'react';
import { Link } from 'react-router-dom';
import SeasonalPromotions from '../components/Halloween/SeasonalPromotions';

const Home: React.FC = () => {
  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-halloween-orange mb-4">
            Premium Wigs for Work, Life & Play
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Professional quality wigs for every day, every occasion, all year round.
          </p>
          <p className="text-lg text-halloween-purple mb-8">
            Try before you buy with our innovative AR technology ✨
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="blood-drip-orange bg-halloween-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Shop All Wigs
            </Link>
            <Link
              to="/ar-tryon"
              className="blood-drip-button bg-halloween-purple hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Try AR Experience
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-halloween-darkPurple p-6 rounded-lg border-2 border-halloween-purple hover:border-halloween-orange transition-colors">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-halloween-orange mb-2">
              AR Try-On
            </h3>
            <p className="text-gray-300">
              See how wigs look on you in real-time with our advanced AR technology. No guessing, just perfect fits.
            </p>
          </div>
          <div className="bg-halloween-darkPurple p-6 rounded-lg border-2 border-halloween-purple hover:border-halloween-orange transition-colors">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-halloween-orange mb-2">
              Year-Round Quality
            </h3>
            <p className="text-gray-300">
              From professional settings to special events. High-quality wigs for work, medical needs, fashion, and celebrations.
            </p>
          </div>
          <div className="bg-halloween-darkPurple p-6 rounded-lg border-2 border-halloween-purple hover:border-halloween-orange transition-colors">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-halloween-orange mb-2">
              Customize & Layer
            </h3>
            <p className="text-gray-300">
              Choose from multiple colors and layer accessories to create your perfect look. Endless possibilities.
            </p>
          </div>
        </div>

        {/* Alter Ego Section */}
        <div className="mb-16 bg-gradient-to-br from-halloween-darkPurple via-halloween-black to-halloween-darkPurple p-8 md:p-12 rounded-2xl border-2 border-halloween-purple">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-halloween-orange mb-4">
              Discover Your Alter Ego
            </h2>
            <p className="text-xl text-gray-300 mb-2">
              Who will you become today?
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Step into an immersive experience where your personality transforms your world. 
              Choose your alter ego and watch everything change—from the atmosphere to your perfect wig recommendations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-halloween-purple/30 text-center hover:border-halloween-orange transition-all">
              <div className="text-4xl mb-3">🖤</div>
              <h3 className="text-lg font-bold text-white mb-1">Villain</h3>
              <p className="text-sm text-gray-400">Dark & Powerful</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-halloween-purple/30 text-center hover:border-halloween-orange transition-all">
              <div className="text-4xl mb-3">👑</div>
              <h3 className="text-lg font-bold text-white mb-1">Queen</h3>
              <p className="text-sm text-gray-400">Elegant & Regal</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-halloween-purple/30 text-center hover:border-halloween-orange transition-all">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-white mb-1">Rebel</h3>
              <p className="text-sm text-gray-400">Bold & Untamed</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-halloween-purple/30 text-center hover:border-halloween-orange transition-all">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-white mb-1">Icon</h3>
              <p className="text-sm text-gray-400">Trendy & Fearless</p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/alter-ego.html"
              className="inline-block bg-halloween-purple hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-lg transition-all hover:scale-105 shadow-lg hover:shadow-halloween-purple/50"
            >
              Enter the Alter Ego Room →
            </a>
            <p className="text-sm text-gray-500 mt-3">
              An interactive experience that transforms with your choice
            </p>
          </div>
        </div>

        {/* Shop by Occasion Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-halloween-orange text-center mb-8">
            Find Your Perfect Style
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/products?theme=professional"
              className="bg-halloween-darkPurple p-6 rounded-lg border-2 border-halloween-purple hover:border-halloween-orange transition-all hover:scale-105 text-center"
            >
              <div className="text-3xl mb-2">💼</div>
              <h3 className="text-lg font-bold text-white">Professional</h3>
              <p className="text-sm text-gray-400">Work & Business</p>
            </Link>
            <Link
              to="/products?theme=casual"
              className="bg-halloween-darkPurple p-6 rounded-lg border-2 border-halloween-purple hover:border-halloween-orange transition-all hover:scale-105 text-center"
            >
              <div className="text-3xl mb-2">👕</div>
              <h3 className="text-lg font-bold text-white">Everyday</h3>
              <p className="text-sm text-gray-400">Casual & Comfort</p>
            </Link>
            <Link
              to="/products?theme=fashion"
              className="bg-halloween-darkPurple p-6 rounded-lg border-2 border-halloween-purple hover:border-halloween-orange transition-all hover:scale-105 text-center"
            >
              <div className="text-3xl mb-2">✨</div>
              <h3 className="text-lg font-bold text-white">Fashion</h3>
              <p className="text-sm text-gray-400">Bold & Trendy</p>
            </Link>
            <Link
              to="/products?theme=witch"
              className="bg-halloween-darkPurple p-6 rounded-lg border-2 border-halloween-purple hover:border-halloween-orange transition-all hover:scale-105 text-center"
            >
              <div className="text-3xl mb-2">🎃</div>
              <h3 className="text-lg font-bold text-white">Costume</h3>
              <p className="text-sm text-gray-400">Events & Parties</p>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-halloween-purple to-halloween-darkPurple p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold text-halloween-orange mb-4">
            Why Choose Spooky Wigs?
          </h2>
          <p className="text-gray-300 mb-6">
            A unique shopping experience that makes finding your perfect wig simple and fun. 
            Try on any style with AR, customize colors, and shop with confidence—365 days a year.
          </p>
          <Link
            to="/products"
            className="bg-halloween-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Explore All Wigs
          </Link>
        </div>
      </div>

      {/* Seasonal Promotions Section */}
      <SeasonalPromotions />
    </div>
  );
};

export default Home;
