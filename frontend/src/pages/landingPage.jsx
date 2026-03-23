import React from 'react';
import { Link } from 'react-router-dom';
// Import the public components from your project structure
import Header from '../components/Header';   // Assuming you placed public header in 'components/'
import Hero from '../components/Hero';       // Assuming you placed hero in 'components/'
import Features from '../components/Features'; // Assuming this holds the 'How It Works' section
import Footer from '../components/Footer';   // Assuming this holds the final CTA and footer
import Testimonials from '../components/testimonial';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Header (Navigation Bar) */}
      <Header />
      
      <main>
        {/* 2. Hero Section (Connect Crops to Markets) */}
        <Hero />
        
        {/* 3. Features (How It Works) Section */}
        <Features />
        
        {/* 4. Testimonials Section - Updated for Sales/Marketplace focus */}
        <Testimonials/>

        {/* 5. Final CTA / Footer */}
        <Footer />
        
      </main>
    </div>
  );
};

export default LandingPage;
