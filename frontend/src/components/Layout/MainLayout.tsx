import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import HalloweenDecorations from '../Halloween/HalloweenDecorations';
import AmbientSounds from '../Halloween/AmbientSounds';
import PageTransition from '../Halloween/PageTransition';
import IdleAnimations from '../Halloween/IdleAnimations';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-halloween-black text-white flex flex-col relative overflow-hidden">
      {/* Halloween decorative elements */}
      <HalloweenDecorations />
      
      {/* Ambient sound controls */}
      <AmbientSounds />
      
      {/* Idle animations - triggers after 1 minute of inactivity */}
      <IdleAnimations idleTimeout={60000} />
      
      <Header />
      <main className="flex-grow relative z-20">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
